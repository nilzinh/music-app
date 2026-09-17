'use client'

import {
  usePlayerContext
} from '@/contexts/PlayerContext'


export default function usePlayer(){

  return usePlayerContext()

}