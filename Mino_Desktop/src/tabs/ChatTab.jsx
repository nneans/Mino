import "./ChatTab.css"
export default function ChatTab({
    messages, chatInput, setChatInput, chatLoading, onSend
}) {
    return (
        <div className="chat-container">
            <div className="chat-messages">
                {messages.map((msg, i) => (
                    <div key={i} className={`chat-bubble ${msg.role}`}>
                        {msg.content}
                    </div>
                ))}
                {chatLoading && <div className="chat-bubble assistant typing">...</div>}
            </div>
            <div className="chat-input-area">
                <input
                    type="text"
                    placeholder="Mino에게 물어보세요..."
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter' && e.nativeEvent.isComposing === false) {
                            e.preventDefault();
                            onSend();
                        }
                    }}
                />
                <button onClick={() => !chatLoading && onSend()} disabled={chatLoading}>
                    전송
                </button>
            </div>
        </div>
    )
}
