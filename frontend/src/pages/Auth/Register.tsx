import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { authService } from '../../services/auth.service';

const registerSchema = z.object({
  email: z.string().email().endsWith('@kazguu.kz', 'Must be @kazguu.kz email'),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      await authService.register(data);
      toast.success('Verification code sent to your email!');
      navigate('/verify-email', { state: { email: data.email } });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create Account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Register with @kazguu.kz email</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <input {...register('firstName')} type="text" placeholder="First Name" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            <input {...register('lastName')} type="text" placeholder="Last Name" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            <input {...register('email')} type="email" placeholder="student@kazguu.kz" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            <input {...register('password')} type="password" placeholder="Password" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700">
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
          <div className="text-center">
            <Link to="/login" className="text-primary-600">Already have an account? Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
