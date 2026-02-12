/**
 * Email Sync & LLM Services (IPC Mode)
 * Replaces Python backend/services.py and routes/sync.py
 */
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const fetch = require('node-fetch');
const database = require('./database');
const configService = require('./config');
const { EXPENSE_CATEGORIES } = require('./constants');

// Normalization Helper
function normalizeMerchantName(name) {
    if (!name) return "";
    let normalized = name;
    // Remove business suffixes
    normalized = normalized.replace(/\(주\)|주식회사|컴퍼니|corporation|inc\./gi, '').trim();
    // Remove branch information
    normalized = normalized.replace(/\s+\S+점$|\S+점$/, '').trim();
    normalized = normalized.replace(/\s+\S+지점$|\S+지점$/, '').trim();
    // Split details
    if (normalized.includes(' - ')) normalized = normalized.split(' - ')[0];
    else if (normalized.includes(' / ')) normalized = normalized.split(' / ')[0];
    return normalized.trim();
}

/**
 * Call LLM for text analysis
 */
async function callLLM(prompt, config) {
    let provider = 'ollama';
    let apiKey = '';

    // Priority: If ollama_model is set, use Ollama first
    if (config.ollama_model) {
        provider = 'ollama';
    } else if (config.api_keys && config.api_keys.length > 0) {
        provider = config.api_keys[0].provider || 'ollama';
        apiKey = config.api_keys[0].key || '';
    } else {
        provider = config.llm_provider || 'ollama';
        apiKey = config.api_key || '';
    }

    try {
        if (provider === 'ollama') {
            const ollamaUrl = config.ollama_url || 'http://localhost:11434';
            const modelName = config.ollama_model || 'gemma2:2b';

            const response = await fetch(`${ollamaUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: modelName,
                    prompt: prompt,
                    stream: false,
                    options: { temperature: 0.7, num_predict: 1024 }
                })
            });

            if (response.ok) {
                const data = await response.json();
                return data.response || '';
            }
        } else if (['openai', 'gemini', 'deepseek', 'groq', 'claude'].includes(provider)) {
            // Cloud Providers (OpenAI Compatible)
            if (!apiKey) return null;

            const providerConfig = {
                'openai': { url: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o-mini', authHeader: 'Authorization', prefix: 'Bearer ' },
                'gemini': { url: `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`, model: 'gemini-1.5-flash', authHeader: 'Authorization', prefix: 'Bearer ' },
                'deepseek': { url: 'https://api.deepseek.com/chat/completions', model: 'deepseek-chat', authHeader: 'Authorization', prefix: 'Bearer ' },
                'groq': { url: 'https://api.groq.com/openai/v1/chat/completions', model: 'llama-3.3-70b-versatile', authHeader: 'Authorization', prefix: 'Bearer ' },
                'claude': { url: 'https://api.anthropic.com/v1/messages', model: 'claude-3-5-sonnet-20241022', authHeader: 'x-api-key', prefix: '' }
            };

            const cfg = providerConfig[provider];
            if (!cfg) return null;

            const headers = { 'Content-Type': 'application/json' };
            headers[cfg.authHeader] = `${cfg.prefix}${apiKey}`;
            if (provider === 'claude') headers['anthropic-version'] = '2023-06-01';

            let payload;
            if (provider === 'claude') {
                payload = {
                    model: cfg.model,
                    max_tokens: 1024,
                    messages: [{ role: 'user', content: prompt }]
                };
            } else {
                payload = {
                    model: cfg.model,
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 1024
                };
            }

            const response = await fetch(cfg.url, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                if (provider === 'claude') return data.content[0].text;
                return data.choices[0].message.content;
            } else {
                const errText = await response.text();
                console.error(`LLM Error (${provider}):`, errText);
            }
        }
    } catch (e) {
        console.error('LLM Call Failed:', e);
    }
    return null;
}

/**
 * Analyze a single email body using LLM
 */
/**
 * Analyze a single email body using LLM
 */
async function analyzeEmail(body, config, referenceDate) {
    // 1. Clean HTML tags to fallback to text
    let cleanText = body;
    try {
        // Remove style/script blocks first
        cleanText = cleanText.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ');
        // Remove tags
        cleanText = cleanText.replace(/<[^>]+>/g, ' ');
        // Normalize whitespace
        cleanText = cleanText.replace(/\s+/g, ' ').trim();
    } catch (e) {
        cleanText = body.substring(0, 1000);
    }

    // Limit length for small models
    const promptText = cleanText.substring(0, 800);
    const dateStr = referenceDate ? new Date(referenceDate).toLocaleString('ko-KR') : new Date().toLocaleString('ko-KR');

    const prompt = `You are a financial data parser. Extract transaction details from the email text below and return ONLY valid JSON.

[Context]
Email Date: ${dateStr} (Use this year/month if missing)

[Email Text]
${promptText}

[Rules]
- Place: Shop name (Remove '(주)', 'Inc', branch names). Keep original Korean.
- Amount: Number only (Remove separators).
- Date: YYYY-MM-DD HH:MM:SS format.
- Category: [Food, Cafe, Shopping, Transport, Bills, Fixed, Transfer, Medical, Exercise, Others]
- Type: 'expense' (default) or 'income'.

[Output Format]
{
    "transaction_date": "2024-01-01 12:00:00",
    "place": "Starbucks",
    "amount": 5000,
    "category": "Cafe",
    "type": "expense",
    "raw_text_summary": "Summary of transaction..."
}
NO markdown, NO explanation. Just JSON.`;

    const jsonText = await callLLM(prompt, config);
    if (!jsonText) return null;

    try {
        const cleaned = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);

            // Validation / Fallback
            if (!data.amount) return null;
            if (!data.transaction_date && referenceDate) {
                data.transaction_date = new Date(referenceDate).toISOString().replace('T', ' ').slice(0, 19);
            }

            // User category rule check
            const ruleCategory = database.getCategoryForPlace(data.place);
            if (ruleCategory) {
                data.category = ruleCategory;
            }
            return data;
        }
    } catch (e) {
        console.error('JSON Parse Error:', e);
    }
    return null;
}

/**
 * Fetch emails from Gmail via IMAP
 */
/**
 * Fetch emails from Gmail via IMAP
 * Uses simpleParser for robust parsing of headers and body
 */
function fetchEmails(config, days = 7) {
    return new Promise((resolve, reject) => {
        const gmailUser = config.gmail_user;
        const gmailPass = config.gmail_app_pass;

        if (!gmailUser || !gmailPass) {
            return reject(new Error('Gmail credentials missing'));
        }

        const imap = new Imap({
            user: gmailUser,
            password: gmailPass,
            host: 'imap.gmail.com',
            port: 993,
            tls: true,
            tlsOptions: { rejectUnauthorized: false },
            authTimeout: 3000
        });

        const emails = [];
        const parsePromises = [];

        imap.once('ready', function () {
            imap.openBox('INBOX', true, function (err, box) {
                if (err) {
                    imap.end();
                    return reject(err);
                }

                const sinceDate = new Date();
                sinceDate.setDate(sinceDate.getDate() - (days - 1));
                const sinceDateStr = sinceDate.toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).replace(/,/g, '');

                const searchCriteria = [['SINCE', sinceDateStr], ['SUBJECT', '[Mino_DATA]']];

                imap.search(searchCriteria, function (err, results) {
                    if (err || !results.length) {
                        imap.end();
                        return resolve([]);
                    }

                    // Fetch last 50 emails, get FULL body for parsing
                    const fetch = imap.fetch(results.slice(-50), {
                        bodies: ''
                    });

                    fetch.on('message', function (msg, seqno) {
                        msg.on('body', function (stream, info) {
                            // Parse stream directly with mailparser
                            const p = simpleParser(stream)
                                .then(parsed => {
                                    return {
                                        subject: parsed.subject,
                                        date: parsed.date,
                                        message_id: parsed.messageId, // mailparser standardizes this
                                        body: parsed.text || parsed.html || '' // Prefer text, fallback to html
                                    };
                                })
                                .catch(err => {
                                    console.error('Email parse error:', err);
                                    return null;
                                });
                            parsePromises.push(p);
                        });
                    });

                    fetch.once('error', function (err) {
                        imap.end();
                        reject(err);
                    });

                    fetch.once('end', function () {
                        // Wait for all parsing to finish
                        Promise.all(parsePromises).then(processed => {
                            imap.end();
                            // Filter out failed parses
                            resolve(processed.filter(e => e));
                        });
                    });
                });
            });
        });

        imap.once('error', function (err) {
            console.error('IMAP Error:', err);
            reject(err);
        });

        imap.connect();
    });
}

/**
 * Main Sync Function (Called via IPC)
 */
let isCancelled = false;

function cancelSync() {
    isCancelled = true;
}

async function syncGmail(window) {
    const config = configService.getConfig();
    isCancelled = false; // Reset cancellation state

    // Status helper
    const sendStatus = (data) => {
        if (window && window.webContents) {
            window.webContents.send('sync:progress', data);
        }
    };

    try {
        sendStatus({ type: 'status', message: '📧 Gmail 연결 중...', step: 'connecting' });

        // Check cancellation
        if (isCancelled) { throw new Error('작업이 취소되었습니다.'); }

        const rawEmails = await fetchEmails(config, 7);

        // Check cancellation
        if (isCancelled) { throw new Error('작업이 취소되었습니다.'); }

        const total = rawEmails.length;

        if (total === 0) {
            sendStatus({ type: 'complete', message: '새로운 메일이 없습니다.', count: 0, skipped: 0 });
            return { status: 'success', count: 0 };
        }

        sendStatus({ type: 'status', message: `📥 ${total}개의 이메일 발견`, step: 'found', total });

        let count = 0;
        let skipped = 0;

        // Begin transaction for batch performance
        database.beginTransaction();

        try {
            for (let i = 0; i < total; i++) {
                // Check cancellation
                if (isCancelled) {
                    database.rollbackTransaction();
                    sendStatus({ type: 'error', message: '⛔️ 사용자에 의해 중단되었습니다.', cancelled: true });
                    return { status: 'cancelled' };
                }

                const email = rawEmails[i];

                // Duplicate Check 1: Message-ID
                if (email.message_id && database.expenseExistsByMessageId(email.message_id)) {
                    skipped++;
                    sendStatus({ type: 'duplicate', message: `🔄 [${i + 1}/${total}] 이미 처리됨`, current: i + 1 });
                    continue;
                }

                sendStatus({ type: 'analyzing', message: `🔍 [${i + 1}/${total}] 분석 중...`, current: i + 1, total });

                // Prefer text body, fallback to html (analyzeEmail will strip html tags anyway)
                // Determine best reference date from email.date
                const referenceDate = email.date ? new Date(email.date) : new Date();

                // Analyze
                const parsed = await analyzeEmail(email.body, config, referenceDate);

                if (!parsed) {
                    sendStatus({ type: 'skip', message: `⏭️ [${i + 1}/${total}] 분석 실패`, current: i + 1 });
                    continue;
                }

                // Save
                const saveData = {
                    ...parsed,
                    source: 'Gmail',
                    email_message_id: email.message_id
                };

                try {
                    database.addExpense(saveData);
                    database.updateGraph(saveData);
                    count++;
                    sendStatus({ type: 'saved', message: `✅ [${i + 1}/${total}] ${parsed.place} (${parsed.amount}원)`, current: i + 1 });
                } catch (e) {
                    console.error('Save error:', e);
                }
            }

            // Commit transaction
            database.commitTransaction();

        } catch (loopError) {
            database.rollbackTransaction();
            throw loopError;
        }

        // Update Last Sync
        database.setSyncInfo('last_sync', new Date().toISOString());

        sendStatus({ type: 'complete', message: `🎉 완료! ${count}개 저장, ${skipped}개 건너뜀`, count, skipped });
        return { status: 'success', count };

    } catch (e) {
        console.error('Sync Error:', e);
        sendStatus({ type: 'error', message: `오류: ${e.message}` });
        return { status: 'error', message: e.message };
    }
}

module.exports = {
    syncGmail,
    cancelSync,
    callLLM // Exposed for Chat feature
};
