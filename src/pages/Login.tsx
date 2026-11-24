import { Eye, EyeOff, LockKeyhole, UserRound } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import students from '../assets/students.webp';
import { Logo, StackedBooks } from '../components/Art';
import { useSession } from '../state';

function Waves() {
  return (
    <svg className="login-waves" viewBox="0 0 1240 1100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="lw1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#c5a8f2" /><stop offset=".5" stopColor="#a99bf0" /><stop offset="1" stopColor="#7fa4f3" /></linearGradient>
        <linearGradient id="lw2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d9d4fb" /><stop offset="1" stopColor="#b7c9fa" /></linearGradient>
      </defs>
      <path d="M1240 0H900c-60 130-130 170-210 250-90 92-96 210-40 330 60 130-10 280-160 400-40 32-40 80-30 120h780z" fill="url(#lw2)" opacity=".75" />
      <path d="M1240 0H900c-60 130-130 170-200 240 180-30 330-20 540-240z" fill="url(#lw1)" opacity=".85" />
      <path d="M1240 60c-130 160-310 170-540 190 160 40 380-10 540-110z" fill="#fff" opacity=".35" />
      <path d="M1240 120c-70 60-120 90-160 110 20 60 80 100 160 110z" fill="#8f9df0" opacity=".4" />
      <path d="M900 0c-60 130-130 170-210 250" stroke="#fff" strokeWidth="4" fill="none" opacity=".9" />
    </svg>
  );
}

export function LoginPage() {
  const { login } = useSession();
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [forgot, setForgot] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !pw) return setError('Enter your Student ID or email, and your password.');
    if (!login(id, pw)) setError('That ID and password do not match. Check them and try again.');
  };

  return (
    <div className="login">
      <div className="login-card">
        <Waves />
        <img className="login-students" src={students} alt="" />
        <svg className="login-front" viewBox="0 0 800 260" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="lf1" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#e3dcfb" /><stop offset=".35" stopColor="#a78cf0" /><stop offset="1" stopColor="#8fa6f5" /></linearGradient>
            <linearGradient id="lf2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#a78cf0" /><stop offset="1" stopColor="#b4d0fb" /></linearGradient>
          </defs>
          <path d="M0 260C70 235 120 110 280 92c150-16 220 66 340 50 80-12 130-50 180-90v208z" fill="url(#lf1)" />
          <path d="M260 260c100-30 190-50 290-92 90-38 170-74 250-92v184z" fill="url(#lf2)" opacity=".9" />
          <path d="M0 260C70 235 120 110 280 92c150-16 220 66 340 50 80-12 130-50 180-90" stroke="#fff" strokeOpacity=".55" strokeWidth="3" fill="none" />
        </svg>
        <StackedBooks />
        <form className="login-form" onSubmit={submit} noValidate>
          <Logo big />
          <h1>Student Login</h1>
          <h2>Classes 9 – 10</h2>
          {forgot ? (
            <>
              <p className="login-help">Your school manages student passwords. Ask your class teacher or the school office to reset yours, and have your Student ID ready.</p>
              <button type="button" className="btn btn-lg" onClick={() => setForgot(false)}>Back to Login</button>
            </>
          ) : (
            <>
              <label className="field"><UserRound /><input value={id} onChange={(e) => { setId(e.target.value); setError(''); }} placeholder="Student ID or Email" aria-label="Student ID or Email" autoComplete="username" /></label>
              <label className="field">
                <LockKeyhole /><input type={show ? 'text' : 'password'} value={pw} onChange={(e) => { setPw(e.target.value); setError(''); }} placeholder="Password" aria-label="Password" autoComplete="current-password" />
                <button type="button" className="eye" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={24} /> : <Eye size={24} />}</button>
              </label>
              {error && <p className="login-error" role="alert">{error}</p>}
              <button className="btn btn-lg">Login</button>
              <button type="button" className="link" onClick={() => setForgot(true)}>Forgot Password?</button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
