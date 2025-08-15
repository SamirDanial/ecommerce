import React from 'react';

interface UserAvatarProps {
  user: {
    id: number;
    name: string;
    avatar?: string | null;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = 'md', className = '' }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base'
  };

  const [imageError, setImageError] = React.useState(false);

  return (
    <div className={`${sizeClasses[size]} ${className} rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden`}>
      {user.avatar && !imageError ? (
        <img
          src={user.avatar}
          alt={user.name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-full bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium">
          {getInitials(user.name)}
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
