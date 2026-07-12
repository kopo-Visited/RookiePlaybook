import { Component } from 'react';
import styles from './ErrorBoundary.module.css';
import Button from '../Button/Button';

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // eslint-disable-next-line no-console
    console.error('예상치 못한 렌더링 오류', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.wrap}>
          <p className={styles.title}>예상치 못한 오류가 발생했습니다.</p>
          <p className={styles.message}>
            페이지를 새로고침해도 문제가 계속되면 관리자에게 문의해주세요.
          </p>
          <Button onClick={this.handleReload}>새로고침</Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
