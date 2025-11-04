import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import { Audio, AVPlaybackStatus } from "expo-av";

export interface Song {
  _id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
}

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  positionMillis: number;
  durationMillis: number | null;
  songList: Song[];
  currentIndex: number;
  setQueue: (songs: Song[], startIndex: number) => Promise<void>;
  togglePlay: () => Promise<void>;
  nextSong: () => Promise<void>;
  prevSong: () => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [songList, setSongList] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState<number | null>(null);

  const soundRef = useRef<Audio.Sound | null>(null);
  const isChangingRef = useRef(false);


  useEffect(() => {
    return () => {
      if (soundRef.current) soundRef.current.unloadAsync();
    };
  }, []);

  const onPlaybackStatusUpdate = async (status: AVPlaybackStatus) => {
    if (!status || !("isLoaded" in status) || !status.isLoaded) return;

    setIsPlaying(status.isPlaying ?? false);
    setPositionMillis(status.positionMillis ?? 0);
    setDurationMillis(status.durationMillis ?? null);


    if (status.didJustFinish && !isChangingRef.current) {
      isChangingRef.current = true;
      await nextSong();
      isChangingRef.current = false;
    }
  };

  const playSong = async (song: Song) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: song.audioUrl },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);

      setCurrentSong(song);
      setIsPlaying(true);
      setPositionMillis(0);
    } catch (err) {
      console.warn("playSong error:", err);
    }
  };



  const setQueue = async (songs: Song[], startIndex: number) => {
    if (!songs || songs.length === 0) return;
    setSongList(songs);
    setCurrentIndex(startIndex);
    await playSong(songs[startIndex]);
  };

  // ⏯ Tạm dừng / tiếp tục
  const togglePlay = async () => {
    const sound = soundRef.current;
    if (!sound) return;

    const status = await sound.getStatusAsync();
    if (!status.isLoaded) return;

    if (status.isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  // ⏭ Bài kế tiếp
  const nextSong = async () => {
    if (songList.length === 0) return;
    const next = (currentIndex + 1) % songList.length;
    setCurrentIndex(next);
    const nextTrack = songList[next];
    await playSong(nextTrack);
  };

  // ⏮ Bài trước
  const prevSong = async () => {
    if (songList.length === 0)
      return; const prev = (currentIndex - 1 + songList.length) % songList.length;
    setCurrentIndex(prev);
    await playSong(songList[prev]);
  };


  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        positionMillis,
        durationMillis,
        songList,
        currentIndex,
        setQueue,
        togglePlay,
        nextSong,
        prevSong,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
};
