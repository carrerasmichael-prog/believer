import React from "react";

interface RoomTemplateProps {
  title: string;
  children?: React.ReactNode;
}

const RoomTemplate: React.FC<RoomTemplateProps> = ({ title, children }) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <div>{children}</div>
    </div>
  );
};

export default RoomTemplate;
