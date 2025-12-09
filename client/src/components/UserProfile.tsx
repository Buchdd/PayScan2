// UserProfile.tsx - исправленная версия
import React, { useState } from 'react';
import type { FrameworkUser } from '../types';
import '../styles/user-profile.css';

interface UserProfileProps {
  user: FrameworkUser;
  passportData?: {
    series: string;
    number: string;
    issuedBy: string;
    issueDate: string;
  };
  verificationStatus?: 'verified' | 'pending' | 'not_verified' | 'rejected';
  onVerificationRequest?: () => void;
  onEditProfile?: () => void;
  defaultCollapsed?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({
  user,
  passportData,
  verificationStatus = 'not_verified',
  onVerificationRequest,
  onEditProfile,
  defaultCollapsed = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const getStatusText = (status: UserProfileProps['verificationStatus']) => {
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

  const getStatusClass = (status: UserProfileProps['verificationStatus']) => {
    switch (status) {
      case 'verified':
        return 'user-profile__status--verified';
      case 'pending':
        return 'user-profile__status--pending';
      case 'not_verified':
        return 'user-profile__status--not_verified';
      case 'rejected':
        return 'user-profile__status--rejected';
      default:
        return 'user-profile__status--not_verified';
    }
  };

  // Форматируем дату (если есть в user)
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Не указана';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Безопасное получение статуса с дефолтным значением
  const getUserStatus = () => {
    return user?.status || 'active'; // По умолчанию "active"
  };

  const getClientStatusText = (status: string) => {
    const statusLower = status?.toLowerCase() || 'active';
    switch (statusLower) {
      case 'active':
      case 'активен':
        return 'Активен';
      case 'inactive':
      case 'неактивен':
        return 'Неактивен';
      case 'suspended':
      case 'приостановлен':
        return 'Приостановлен';
      default:
        return status || 'Активен';
    }
  };

  const getClientStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || 'active';
    switch (statusLower) {
      case 'active':
      case 'активен':
        return '#10b981';
      case 'inactive':
      case 'неактивен':
        return '#64748b';
      case 'suspended':
      case 'приостановлен':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  // Если нужно получить полное имя
  const fullName = user?.full_name || user?.name || 'Не указано';
  const email = user?.email || 'Не указан';
  const phone = user?.phone || 'Не указан';
  const country = user?.country || 'Не указана';
  const userStatus = getUserStatus();

  // Если user undefined, показываем заглушку
  if (!user) {
    return (
      <div className="card user-profile">
        <div className="user-profile__warning user-profile__warning--pending">
          <p style={{ margin: 0 }}>Данные пользователя загружаются...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card user-profile">
      <div className="card__header user-profile__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="user-profile__collapse-btn"
            aria-label={isCollapsed ? 'Развернуть профиль' : 'Свернуть профиль'}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`user-profile__collapse-icon ${!isCollapsed ? 'expanded' : ''}`}
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
          <div className="user-profile__title">
            <p className="card__eyebrow">Профиль клиента</p>
            <h3>Личная информация</h3>
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
          <span className={`user-profile__status ${getStatusClass(verificationStatus)}`}>
            {getStatusText(verificationStatus)}
          </span>
          <span style={{
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '500',
            backgroundColor: getClientStatusColor(userStatus) + '20',
            color: getClientStatusColor(userStatus),
          }}>
            {getClientStatusText(userStatus)}
          </span>
        </div>
      </div>

      {!isCollapsed && (
        <div className="user-profile__content">
          <div className="user-profile__fields">
            {/* Основная информация */}
            <div className="form-field">
              <span>ФИО</span>
              <div className="user-profile__field-value">
                {fullName}
              </div>
            </div>

            <div className="form-field">
              <span>Email</span>
              <div className="user-profile__field-value">
                {email}
              </div>
            </div>

            <div className="form-field">
              <span>Телефон</span>
              <div className="user-profile__field-value">
                {phone}
              </div>
            </div>

            <div className="form-field">
              <span>Страна</span>
              <div className="user-profile__field-value">
                {country}
              </div>
            </div>

            {/* Опциональные поля - показываем только если есть данные */}
            {'date_of_birth' in user && user.date_of_birth && (
              <div className="form-field">
                <span>Дата рождения</span>
                <div className="user-profile__field-value">
                  {formatDate(user.date_of_birth)}
                </div>
              </div>
            )}

            {'created_at' in user && user.created_at && (
              <div className="form-field">
                <span>Дата регистрации</span>
                <div className="user-profile__field-value">
                  {formatDate(user.created_at)}
                </div>
              </div>
            )}
          </div>

          {/* Верификация и паспортные данные */}
          <div className="user-profile__passport-section">
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h4 style={{ margin: 0 }}>Паспортные данные</h4>
            </div>

            {passportData ? (
              <div className="user-profile__fields">
                <div className="user-profile__passport-grid">
                  <div className="form-field">
                    <span>Серия паспорта</span>
                    <div className="user-profile__field-value">
                      {passportData.series}
                    </div>
                  </div>

                  <div className="form-field">
                    <span>Номер паспорта</span>
                    <div className="user-profile__field-value">
                      {passportData.number}
                    </div>
                  </div>
                </div>

                <div className="form-field">
                  <span>Кем выдан</span>
                  <div className="user-profile__field-value">
                    {passportData.issuedBy}
                  </div>
                </div>

                <div className="form-field">
                  <span>Дата выдачи</span>
                  <div className="user-profile__field-value">
                    {passportData.issueDate}
                  </div>
                </div>
              </div>
            ) : (
              <div className="user-profile__passport-empty">
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
            {verificationStatus === 'not_verified' && onVerificationRequest && (
              <div className="user-profile__verification-actions">
                <button 
                  className="primary-button" 
                  onClick={onVerificationRequest}
                  style={{ width: '100%' }}
                >
                  Пройти верификацию
                </button>
              </div>
            )}

            {verificationStatus === 'rejected' && (
              <div className="user-profile__warning user-profile__warning--rejected">
                <p style={{ 
                  margin: '0 0 12px 0'
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

            {verificationStatus === 'pending' && (
              <div className="user-profile__warning user-profile__warning--pending">
                <p style={{ margin: 0 }}>
                  Ваши данные находятся на проверке. Обычно это занимает 1-3 рабочих дня.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {isCollapsed && (
        <div className="user-profile__collapsed">
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 16 16" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="user-profile__collapsed-icon"
          >
            <path d="M8 8C9.10457 8 10 7.10457 10 6C10 4.89543 9.10457 4 8 4C6.89543 4 6 4.89543 6 6C6 7.10457 6.89543 8 8 8Z" fill="#64748b"/>
            <path d="M8 9C6.67392 9 5.40215 9.52678 4.46447 10.4645C3.52678 11.4021 3 12.6739 3 14H13C13 12.6739 12.4732 11.4021 11.5355 10.4645C10.5979 9.52678 9.32608 9 8 9Z" fill="#64748b"/>
          </svg>
          <span>
            {fullName} • {phone} • {email}
          </span>
        </div>
      )}
    </div>
  );
};

export default UserProfile;