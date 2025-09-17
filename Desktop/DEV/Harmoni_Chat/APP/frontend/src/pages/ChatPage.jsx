import { useAuth } from '../context/AuthContext';
import ChatBox from '../components/ChatBox';

const ChatPage = () => {
  const { user } = useAuth();

  if (!user) return <p>Please login first.</p>;

  return (
    <div className="container">
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
        {/* Welcome {user.username} */}
      </h2>
      <ChatBox />
    </div>
  );
  
}
export default ChatPage;
