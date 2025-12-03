import React, { useState } from 'react';

export interface UserProfileData {
  fullName: string;
  phone: string;
  email: string;
  passportData?: {
    series: string;
    number: string;
    issuedBy: string;
    issueDate: string;
  };
  verificationStatus: 'verified' | 'pending' | 'not_verified' | 'rejected';
}

interface UserProfileProps {
  user: UserProfileData;
  onVerificationRequest?: () => void;
  onEditProfile?: () => void;
  defaultCollapsed?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({
  user,
  onVerificationRequest,
  onEditProfile,
  defaultCollapsed = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const getStatusText = (status: UserProfileData['verificationStatus']) => {
    switch (status) {
      case 'verified':
        return 'Верифицирован';
      case 'pending':
        return 'На проверке';
      case 'not_verified':
        return 'Не верифицирован';
      case 'rejected':
        return 'Отклонено';
      default:
        return 'Неизвестно';
    }
  };

  const getStatusColor = (status: UserProfileData['verificationStatus']) => {
    switch (status) {
      case 'verified':
        return '#10b981'; // success
      case 'pending':
        return '#f59e0b'; // warning
      case 'not_verified':
        return '#64748b'; // gray
      case 'rejected':
        return '#ef4444'; // error
      default:
        return '#64748b';
    }
  };

  return (
    <div className="card">
      <div className="card__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="button button--small"
            style={{
              background: 'transparent',
              border: 'none',
              padding: '4px',
              cursor: 'pointer',
              minWidth: '24px',
              minHeight: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
            }}
            aria-label={isCollapsed ? 'Развернуть профиль' : 'Свернуть профиль'}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            >
              <path
                d="M4 6L8 10L12 6"
                stroke="#64748b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div>
            <p className="card__eyebrow">Профиль пользователя</p>
            <h3 style={{ margin: 0 }}>Личная информация</h3>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {!isCollapsed && onEditProfile && (
            <button 
              className="button button--small" 
              onClick={onEditProfile}
            >
              Редактировать
            </button>
          )}
          <span style={{
            padding: '4px 12px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: '600',
            backgroundColor: getStatusColor(user.verificationStatus) + '20',
            color: getStatusColor(user.verificationStatus),
            border: `1px solid ${getStatusColor(user.verificationStatus)}`,
            whiteSpace: 'nowrap'
          }}>
            {getStatusText(user.verificationStatus)}
          </span>
        </div>
      </div>

      {!isCollapsed && (
        <div style={{ 
          display: 'grid', 
          gap: '24px',
          gridTemplateColumns: '1fr',
          marginTop: '16px'
        }}>
          {/* Основная информация */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-field">
              <span>ФИО</span>
              <div style={{ 
                padding: '10px 12px', 
                backgroundColor: '#f8fafc', 
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                {user.fullName}
              </div>
            </div>

            <div className="form-field">
              <span>Телефон</span>
              <div style={{ 
                padding: '10px 12px', 
                backgroundColor: '#f8fafc', 
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                {user.phone}
              </div>
            </div>

            <div className="form-field">
              <span>Email</span>
              <div style={{ 
                padding: '10px 12px', 
                backgroundColor: '#f8fafc', 
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                {user.email}
              </div>
            </div>
          </div>

          {/* Верификация и паспортные данные */}
          <div style={{ 
            borderTop: '1px solid #e2e8f0', 
            paddingTop: '24px'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h4 style={{ margin: 0 }}>Паспортные данные</h4>
            </div>

            {user.passportData ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-field">
                    <span>Серия паспорта</span>
                    <div style={{ 
                      padding: '10px 12px', 
                      backgroundColor: '#f8fafc', 
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0'
                    }}>
                      {user.passportData.series}
                    </div>
                  </div>

                  <div className="form-field">
                    <span>Номер паспорта</span>
                    <div style={{ 
                      padding: '10px 12px', 
                      backgroundColor: '#f8fafc', 
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0'
                    }}>
                      {user.passportData.number}
                    </div>
                  </div>
                </div>

                <div className="form-field">
                  <span>Кем выдан</span>
                  <div style={{ 
                    padding: '10px 12px', 
                    backgroundColor: '#f8fafc', 
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    {user.passportData.issuedBy}
                  </div>
                </div>

                <div className="form-field">
                  <span>Дата выдачи</span>
                  <div style={{ 
                    padding: '10px 12px', 
                    backgroundColor: '#f8fafc', 
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    {user.passportData.issueDate}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '32px',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                border: '1px dashed #e2e8f0'
              }}>
                <p style={{ margin: '0 0 8px 0', color: '#64748b' }}>
                  Паспортные данные не предоставлены
                </p>
                <p style={{ 
                  margin: 0, 
                  fontSize: '14px', 
                  color: '#94a3b8' 
                }}>
                  Для верификации аккаунта необходимо предоставить паспортные данные
                </p>
              </div>
            )}

            {/* Действия по верификации */}
            {user.verificationStatus === 'not_verified' && onVerificationRequest && (
              <div style={{ 
                marginTop: '24px', 
                paddingTop: '20px',
                borderTop: '1px solid #e2e8f0'
              }}>
                <button 
                  className="primary-button" 
                  onClick={onVerificationRequest}
                  style={{ width: '100%' }}
                >
                  Пройти верификацию
                </button>
              </div>
            )}

            {user.verificationStatus === 'rejected' && (
              <div style={{ 
                marginTop: '20px',
                padding: '16px',
                backgroundColor: '#fee2e220',
                borderRadius: '12px',
                border: '1px solid #fecaca'
              }}>
                <p style={{ 
                  margin: '0 0 12px 0', 
                  color: '#991b1b',
                  fontSize: '14px'
                }}>
                  В верификации отказано. Пожалуйста, проверьте корректность данных и попробуйте снова.
                </p>
                {onVerificationRequest && (
                  <button 
                    className="ghost-button" 
                    onClick={onVerificationRequest}
                    style={{ width: '100%' }}
                  >
                    Отправить повторно
                  </button>
                )}
              </div>
            )}

            {user.verificationStatus === 'pending' && (
              <div style={{ 
                marginTop: '20px',
                padding: '16px',
                backgroundColor: '#fef3c720',
                borderRadius: '12px',
                border: '1px solid #fde68a'
              }}>
                <p style={{ 
                  margin: 0, 
                  color: '#92400e',
                  fontSize: '14px'
                }}>
                  Ваши данные находятся на проверке. Обычно это занимает 1-3 рабочих дня.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {isCollapsed && (
        <div style={{ 
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '14px',
          color: '#64748b'
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 8C9.10457 8 10 7.10457 10 6C10 4.89543 9.10457 4 8 4C6.89543 4 6 4.89543 6 6C6 7.10457 6.89543 8 8 8Z" fill="#64748b"/>
            <path d="M8 9C6.67392 9 5.40215 9.52678 4.46447 10.4645C3.52678 11.4021 3 12.6739 3 14H13C13 12.6739 12.4732 11.4021 11.5355 10.4645C10.5979 9.52678 9.32608 9 8 9Z" fill="#64748b"/>
          </svg>
          <span>
            {user.fullName} • {user.phone} • {user.email}
          </span>
        </div>
      )}
    </div>
  );
};

export default UserProfile;