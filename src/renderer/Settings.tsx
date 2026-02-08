import { useEffect, useState } from 'react';

import {
  DEFAULT_MEAL_REMINDER,
  type MealReminderSettings,
  type MealTime,
} from '../shared/types';

function Settings(): JSX.Element {
  const [settings, setSettings] = useState<MealReminderSettings>(DEFAULT_MEAL_REMINDER);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // 설정 로드
  useEffect(() => {
    window.maenggu?.mealReminder.getSettings().then(setSettings);
  }, []);

  const handleEnabledChange = (enabled: boolean): void => {
    setSettings((prev) => ({ ...prev, enabled }));
  };

  const handleMessageChange = (message: string): void => {
    setSettings((prev) => ({ ...prev, message }));
  };

  const handleTimeChange = (index: number, field: 'hour' | 'minute', value: number): void => {
    setSettings((prev) => ({
      ...prev,
      times: prev.times.map((time, i) =>
        i === index ? { ...time, [field]: value } : time,
      ),
    }));
  };

  const handleAddTime = (): void => {
    if (settings.times.length >= 5) return;
    setSettings((prev) => ({
      ...prev,
      times: [...prev.times, { hour: 12, minute: 0 }],
    }));
  };

  const handleRemoveTime = (index: number): void => {
    if (settings.times.length <= 1) return;
    setSettings((prev) => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async (): Promise<void> => {
    setIsSaving(true);
    setMessage(null);
    try {
      await window.maenggu?.mealReminder.saveSettings(settings);
      setMessage('저장되었습니다!');
      setTimeout(() => setMessage(null), 2000);
    } catch {
      setMessage('저장 실패');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>맹구 설정</h1>

      {/* 알림 활성화 */}
      <div style={styles.section}>
        <label style={styles.label}>
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => handleEnabledChange(e.target.checked)}
            style={styles.checkbox}
          />
          밥시간 알림 사용
        </label>
      </div>

      {/* 알림 시간 목록 */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>알림 시간</span>
          <button
            onClick={handleAddTime}
            disabled={settings.times.length >= 5}
            style={styles.addButton}
          >
            + 추가
          </button>
        </div>
        {settings.times.map((time, index) => (
          <TimeInput
            key={index}
            time={time}
            onChange={(field, value) => handleTimeChange(index, field, value)}
            onRemove={() => handleRemoveTime(index)}
            canRemove={settings.times.length > 1}
          />
        ))}
      </div>

      {/* 알림 메시지 */}
      <div style={styles.section}>
        <label style={styles.sectionTitle}>알림 메시지</label>
        <input
          type="text"
          value={settings.message}
          onChange={(e) => handleMessageChange(e.target.value)}
          style={styles.textInput}
          maxLength={50}
        />
      </div>

      {/* 저장 버튼 */}
      <div style={styles.footer}>
        {message && <span style={styles.message}>{message}</span>}
        <button onClick={handleSave} disabled={isSaving} style={styles.saveButton}>
          {isSaving ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  );
}

type TimeInputProps = {
  readonly time: MealTime;
  readonly onChange: (field: 'hour' | 'minute', value: number) => void;
  readonly onRemove: () => void;
  readonly canRemove: boolean;
};

function TimeInput({ time, onChange, onRemove, canRemove }: TimeInputProps): JSX.Element {
  return (
    <div style={styles.timeRow}>
      <select
        value={time.hour}
        onChange={(e) => onChange('hour', Number(e.target.value))}
        style={styles.select}
      >
        {Array.from({ length: 24 }, (_, i) => (
          <option key={i} value={i}>
            {String(i).padStart(2, '0')}시
          </option>
        ))}
      </select>
      <select
        value={time.minute}
        onChange={(e) => onChange('minute', Number(e.target.value))}
        style={styles.select}
      >
        {[0, 10, 20, 30, 40, 50].map((m) => (
          <option key={m} value={m}>
            {String(m).padStart(2, '0')}분
          </option>
        ))}
      </select>
      {canRemove && (
        <button onClick={onRemove} style={styles.removeButton}>
          ✕
        </button>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 24,
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    maxWidth: 360,
    margin: '0 auto',
  },
  title: {
    fontSize: 20,
    fontWeight: 600,
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 500,
    color: '#666',
    display: 'block',
    marginBottom: 8,
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 15,
    cursor: 'pointer',
  },
  checkbox: {
    width: 18,
    height: 18,
    cursor: 'pointer',
  },
  timeRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  select: {
    padding: '8px 12px',
    fontSize: 14,
    borderRadius: 6,
    border: '1px solid #ddd',
    backgroundColor: '#fff',
    cursor: 'pointer',
  },
  addButton: {
    padding: '4px 12px',
    fontSize: 13,
    borderRadius: 6,
    border: '1px solid #ddd',
    backgroundColor: '#fff',
    cursor: 'pointer',
  },
  removeButton: {
    padding: '4px 8px',
    fontSize: 14,
    borderRadius: 6,
    border: 'none',
    backgroundColor: '#f5f5f5',
    cursor: 'pointer',
    color: '#999',
  },
  textInput: {
    width: '100%',
    padding: '10px 12px',
    fontSize: 14,
    borderRadius: 6,
    border: '1px solid #ddd',
    boxSizing: 'border-box',
  },
  footer: {
    marginTop: 32,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
  },
  message: {
    fontSize: 13,
    color: '#4CAF50',
  },
  saveButton: {
    padding: '10px 24px',
    fontSize: 14,
    fontWeight: 500,
    borderRadius: 8,
    border: 'none',
    backgroundColor: '#4CAF50',
    color: '#fff',
    cursor: 'pointer',
  },
};

export default Settings;
