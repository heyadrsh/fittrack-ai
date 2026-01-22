'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Clear error after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);

      // Auto-submit when 4 digits entered
      if (newPin.length === 4) {
        handleSubmit(newPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };

  const handleSubmit = async (pinToSubmit: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinToSubmit }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/');
        router.refresh();
      } else {
        setError('Invalid PIN');
        setPin('');
      }
    } catch {
      setError('Something went wrong');
      setPin('');
    } finally {
      setIsLoading(false);
    }
  };

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', ''];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      {/* Logo/Title */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight">FITTRACK AI</h1>
        <p className="text-gray-500 mt-2">Enter your 4-digit PIN</p>
      </div>

      {/* PIN Display */}
      <div className="flex gap-4 mb-8">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`w-14 h-14 border-2 border-black flex items-center justify-center text-2xl
              ${pin.length > index ? 'bg-black' : 'bg-white'}`}
          >
            {pin.length > index && (
              <span className="text-white">●</span>
            )}
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 text-red-500 font-semibold animate-pulse">
          {error}
        </div>
      )}

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {numbers.map((num, index) => (
          <button
            key={index}
            onClick={() => num && handleNumberClick(num)}
            disabled={isLoading || !num}
            className={`h-16 text-2xl font-bold border-2 border-black transition-all
              ${num ? 'bg-white hover:bg-gray-100 active:bg-black active:text-white' : 'border-transparent'}
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {num}
          </button>
        ))}
      </div>

      {/* Backspace Button */}
      <button
        onClick={handleBackspace}
        disabled={isLoading || pin.length === 0}
        className="mt-4 px-6 py-3 text-lg font-semibold border-2 border-black
          bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ← Delete
      </button>

      {/* Loading State */}
      {isLoading && (
        <div className="mt-4 text-gray-500">Verifying...</div>
      )}
    </div>
  );
}
