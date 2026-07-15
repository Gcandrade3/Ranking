import { useEffect, useState } from 'react'
import { useSpring, useTransform } from 'framer-motion'

export function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(value, { stiffness: 120, damping: 20 })
  const arredondado = useTransform(spring, (v) => Math.round(v))
  const [texto, setTexto] = useState(() => String(Math.round(value)))

  useEffect(() => {
    spring.set(value)
  }, [value, spring])

  useEffect(() => arredondado.on('change', (v) => setTexto(String(v))), [arredondado])

  return <>{texto}</>
}
