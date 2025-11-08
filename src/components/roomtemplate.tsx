import { RoomConfig } from '../rooms/roomlist';

interface RoomTemplateProps {
  config: RoomConfig;
  children?: React.ReactNode;
}

const RoomTemplate = ({ config, children }: RoomTemplateProps) => {
  return (
    <div className="room-template">
      <h1>{config.name}</h1>
      <p>{config.description}</p>
      {children}
    </div>
  );
};

export default RoomTemplate;
