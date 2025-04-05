import { Github } from 'lucide-react';
import Button from '@/shared/components/ui/Button';
import { signInWithGithub } from '../actions';

interface SigninGitProps {
  className?: string;
}

export default function SigninGit({ className = '' }: SigninGitProps) {
  const handleSignin = () => {
    signInWithGithub();
  };

  return (
    <>
      <Button
        type="button"
        className={`gap-2 ${className}`}
        size="lg"
        onClick={handleSignin}>
        <Github />
        <span className="capitalize">continue with gitHub</span>
      </Button>
    </>
  );
}
