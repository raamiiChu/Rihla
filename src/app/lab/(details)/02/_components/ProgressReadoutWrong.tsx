"use client";

import { useScrollStore } from "@/stores/scroll";

const ProgressReadoutWrong = () => {
  const progress = useScrollStore((state) => state.progress);

  console.log("ProgressReadoutWrong rendered");

  return <div>Progress: {progress.toFixed(4)}</div>;
};

export default ProgressReadoutWrong;
