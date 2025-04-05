import Button from '@/shared/components/ui/Button';
import { signInWithGoogle } from '../actions';
import { GoogleIcon } from './GoogleIcon';

interface SigninGoogleProps {
  className?: string;
}

export default function SigninGoogle({ className = '' }: SigninGoogleProps) {
  const handleSignin = () => {
    signInWithGoogle();
  };

  return (
    <>
      <Button
        type="button"
        className={`gap-2 ${className}`}
        size="lg"
        onClick={handleSignin}>
        <GoogleIcon />
        <span className="capitalize">continue with google</span>
      </Button>
    </>
  );
}
