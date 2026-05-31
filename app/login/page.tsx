'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [message, setMessage] =
    useState('')

  async function handleLogin(
    e: React.FormEvent
  ) {
    e.preventDefault()

    const response = await fetch(
      '/api/login',
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',
        },

        body: JSON.stringify({
          email,
          password,
        }),
      }
    )

    const data = await response.json()

    setMessage(
      data.message ||
        data.error ||
        'Success'
    )
  }

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <form
        onSubmit={handleLogin}
        className='border p-8 rounded-lg w-[400px]'
      >
        <h1 className='text-2xl font-bold mb-4'>
          Login
        </h1>

        <input
          type='email'
          placeholder='Email'
          className='border p-3 w-full mb-4'
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type='password'
          placeholder='Password'
          className='border p-3 w-full mb-4'
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button className='bg-black text-white p-3 w-full'>
          Login
        </button>

        <p className='mt-4'>{message}</p>
      </form>
    </div>
  )
}