import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Mail } from 'lucide-react';

interface SafetyModalProps {
  alerts: string[];
  onConfirm: () => void;
  isOpen: boolean;
}

const SafetyModal: React.FC<SafetyModalProps> = ({ alerts, onConfirm, isOpen }) => {
  const [emailSent, setEmailSent] = useState(false);

  if (!isOpen || alerts.length === 0) return null;

  const handleConfirm = () => {
    // Simulate email sending
    setEmailSent(true);
    setTimeout(() => {
      onConfirm();
      setEmailSent(false); // Reset for next time
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl transform transition-all">
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <AlertTriangle size={32} />
          <h2 className="text-xl font-bold">重要出行警示</h2>
        </div>
        
        <p className="text-gray-600 mb-4">
          检测到目的地涉及以下重要事项（签证/出入境/安全），请务必确认：
        </p>

        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg max-h-60 overflow-y-auto">
          <ul className="list-disc pl-5 space-y-2">
            {alerts.map((alert, idx) => (
              <li key={idx} className="text-gray-800 text-sm font-medium">{alert}</li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-xs text-gray-500">
            *点击确认后，系统将发送备份邮件至您的预留邮箱。
          </p>
          <button
            onClick={handleConfirm}
            disabled={emailSent}
            className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold text-white transition-all
              ${emailSent ? 'bg-green-600' : 'bg-red-600 hover:bg-red-700 active:scale-95'}`}
          >
            {emailSent ? (
              <>
                <CheckCircle size={20} /> 已确认，邮件已发送
              </>
            ) : (
              <>
                <Mail size={20} /> 确认知晓并接收邮件预警
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SafetyModal;