import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import Settings from './Settings';
import './index.css';
import { initTauriApi } from './tauri-api';

// Tauri 환경이면 window.maenggu에 Tauri API 바인딩
initTauriApi();

// 창 종류에 따라 다른 컴포넌트 렌더링
const params = new URLSearchParams(window.location.search);
const windowType = params.get('window');

const Root = windowType === 'settings' ? Settings : App;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
