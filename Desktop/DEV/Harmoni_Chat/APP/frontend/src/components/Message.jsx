const Message = ({ sender, content }) => (
    <div style={{ textAlign: sender === 'you' ? 'right' : 'left' }}>
      <p><strong>{sender}:</strong> {content}</p>
    </div>
  );
  
  export default Message;
  