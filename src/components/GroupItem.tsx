import { ReactCalendarGroupRendererProps } from "react-calendar-timeline";

const GroupItem: React.FC<ReactCalendarGroupRendererProps> = ({ group }) => (
  <div className="flex justify-between items-center px-[15px] w-full h-[calc(100%-16px)] text-[14px]/leading-none rounded-[6px] bg-[#222325]">
    <div className="flex items-center gap-[8px]">
      <img
        src={`http://randomuser.me/api/portraits/women/${Math.round(
          Math.random() * 100
        )}.jpg`}
        alt="profile"
        className="w-[22px] h-[22px] rounded-full"
      />
      <div className="text-[14px] text-white">{group.title}</div>
    </div>
    <span className="text-[16px] text-[#787c84]">
      <ion-icon name="ellipsis-vertical" />
    </span>
  </div>
);

export default GroupItem;
