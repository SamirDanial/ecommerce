// Debug environment variables
export const debugEnvironment = () => {
  console.log('Environment Variables Debug:', {
    NODE_ENV: process.env.NODE_ENV,
    REACT_APP_API_URL: process.env.REACT_APP_API_URL,
    'process.env keys': Object.keys(process.env).filter(key => key.startsWith('REACT_APP_'))
  });
};
