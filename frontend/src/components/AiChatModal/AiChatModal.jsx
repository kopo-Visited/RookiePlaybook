import { useState, useRef, useEffect } from 'react';
import styles from './AiChatModal.module.css';
import { askAi } from '../../api/aiApi';

function AiChatModal({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function handleSend() {
    const question = input.trim();
    if (!question || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: question }]);
    setLoading(true);

    try {
      const res = await askAi(question);
      setMessages(prev => [...prev, { role: 'ai', text: res.data.answer }]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'ai', text: '답변을 가져오는 중 오류가 발생했습니다.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className={styles.modal}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>AI 온보딩 도우미</span>
        <button className={styles.closeBtn} onClick={onClose}>
          ✕
        </button>
      </div>

      <div className={styles.chatArea}>
        {messages.length === 0 && (
          <div className={styles.placeholder}>
            사내 문서와 FAQ를 기준으로 답변해요. 어떤 점이 막혔나요?
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === 'user' ? styles.userBubble : styles.aiBubble}>
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className={styles.aiBubble}>
            <span className={styles.typing}>답변 생성 중...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className={styles.inputArea}>
        <input
          className={styles.input}
          placeholder="추가 질문 입력"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button className={styles.sendBtn} onClick={handleSend} disabled={loading || !input.trim()}>
          전송
        </button>
      </div>
    </div>
  );
}

export default AiChatModal;
