import { ContextType, useCallback, useContext } from "react";
import {
  ReactCalendarItemRendererProps,
  TimelineItem as TTimelineItem,
} from "react-calendar-timeline";
import { TimelineContext } from "../App";

const TimelineItem: React.FC<ReactCalendarItemRendererProps> = ({
  item,
  itemContext,
  getItemProps,
  getResizeProps,
}) => {
  const {
    style: { top, left, width, height },
    ...props
  } = getItemProps(item);
  const { left: leftResizeProps, right: rightResizeProps } = getResizeProps();
  const timeline = useContext(TimelineContext) as NonNullable<
    ContextType<typeof TimelineContext>
  >;

  const setSelectedItem = useCallback(() => {
    timeline.setSelectedItem(item);
  }, [timeline, item]);

  const removeItem = useCallback(() => {
    timeline.removeItem(item.id);
  }, [timeline, item]);

  return (
    <div
      {...props}
      style={{
        top,
        left: `calc(${left} + 4px)`,
        width: `calc(${width} - 8px)`,
        height,
      }}
      className="group absolute z-[82] overflow-hidden flex flex-row justify-between px-[16px] rounded-[6px] bg-[#222325]"
    >
      <div
        className={`timeline-entry__controls pointer-events-none transition duration-[120ms] ease-in-out absolute top-full left-0 flex flex-row justify-center items-center w-full h-full opacity-0 bg-[rgba(0,0,0,0.4)] ${
          !itemContext.resizing &&
          "group-hover:pointer-events-auto group-hover:top-0 group-hover:opacity-100"
        }`}
      >
        <div className="flex flex-row gap-[8px]">
          <div
            className="cursor-pointer flex flex-row justify-center items-center w-[35px] h-[35px] rounded-full bg-[#1b1f20] text-[#fff]"
            onClick={setSelectedItem}
          >
            <ion-icon name="create-outline" />
          </div>
          <div
            className="cursor-pointer flex flex-row justify-center items-center w-[35px] h-[35px] rounded-full bg-[#1b1f20] text-[#fff]"
            onClick={removeItem}
          >
            <ion-icon name="trash-outline" />
          </div>
        </div>
      </div>
      {itemContext.useResizeHandle && leftResizeProps !== undefined && (
        <div
          ref={leftResizeProps.ref}
          className={`${leftResizeProps.className} cursor-${
            itemContext.resizing ? "grabbing" : "grab"
          } transition duration-[120ms] ease-in-out z-[88] absolute left-0 flex flex-row justify-center items-center w-[15px] h-full opacity-${
            itemContext.resizing ? "100" : "0"
          } group-hover:opacity-100 bg-[#333]`}
        >
          <span className="pointer-events-none text-[#787c84]">
            <ion-icon name="pause-outline" />
          </span>
        </div>
      )}
      {itemContext.useResizeHandle && rightResizeProps !== undefined && (
        <div
          ref={rightResizeProps.ref}
          className={`${rightResizeProps.className} cursor-${
            itemContext.resizing ? "grabbing" : "grab"
          } transition duration-[120ms] ease-in-out z-[88] absolute right-0 flex flex-row justify-center items-center w-[15px] h-full opacity-${
            itemContext.resizing ? "100" : "0"
          } group-hover:opacity-100 bg-[#333]`}
        >
          <span className="pointer-events-none text-[#787c84]">
            <ion-icon name="pause-outline" />
          </span>
        </div>
      )}
      <div className="flex flex-col justify-center gap-[6px]">
        <div
          title={item.title as string}
          style={{
            maxHeight: itemContext.dimensions.height,
          }}
          className="select-none overflow-hidden whitespace-nowrap text-ellipsis text-[16px] font-semibold leading-[1.2] text-[#fff]"
        >
          {item.title}
        </div>
        <div className="select-none overflow-hidden whitespace-nowrap text-ellipsis text-[12px] leading-[1.2] text-[#787c84]">
          {(item as TTimelineItem<{ location: string }>).location}
        </div>
      </div>
    </div>
  );
};

export default TimelineItem;
