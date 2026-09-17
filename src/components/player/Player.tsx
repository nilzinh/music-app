'use client'

import usePlayer from '@/hooks/usePlayer'


export default function Player() {

  const {
    currentSong,
    isPlaying,
    pause,
    resume,
    stop,
  } = usePlayer()


  if (!currentSong) {
    return null
  }


  function handlePlayPause(){

    if(isPlaying){

      pause()

    }else{

      resume()

    }

  }


  return (
<>
    
    <div className="
      fixed
      bottom-0
      left-0
      right-0
      bg-zinc-950
      border-t
      border-zinc-800
      p-3
      z-50
    ">

      <div className="
        max-w-5xl
        mx-auto
        flex
        items-center
        gap-3
      ">

        <img
          src={currentSong.thumbnail}
          alt={currentSong.title}
          className="
            w-12
            h-12
            rounded
            object-cover
          "
        />
        


        <div className="flex-1 min-w-0">

          <p className="
            truncate
            font-semibold
            text-white
          ">
            {currentSong.title}
          </p>


          <p className="
            truncate
            text-xs
            text-zinc-400
          ">
            {currentSong.artist}
          </p>

        </div>



        <button
          onClick={handlePlayPause}
          className="
            bg-green-500
            text-black
            rounded-full
            px-4
            py-2
            font-bold
          "
        >

          {isPlaying ? '❚❚' : '▶'}

        </button>



        <button
          onClick={stop}
          className="
            bg-zinc-800
            rounded-full
            px-3
            py-2
          "
        >
          ✕
        </button>


      </div>

    </div>
    </>

  )
}