import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import styles from './PreviewError.module.css';

interface Props {
  onReset: () => void;
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class TemplateErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[createaur] preview render failed:', error, info);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className={styles.root} role="alert">
          <p className={styles.title}>Something went wrong rendering the preview.</p>
          <button type="button" className={styles.action} onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
          <button type="button" className={styles.action} onClick={this.props.onReset}>
            Reset chat
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}