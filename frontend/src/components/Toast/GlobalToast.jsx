import useToastStore from '../../stores/toastStore';
import Toast from './Toast';

function GlobalToast() {
  const message = useToastStore(state => state.message);
  const hide = useToastStore(state => state.hide);

  if (!message) return null;

  return <Toast message={message} onClose={hide} />;
}

export default GlobalToast;
