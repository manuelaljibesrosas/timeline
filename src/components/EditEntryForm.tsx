import { ContextType, useCallback, useContext, useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { TimelineContext } from "../App";
import { easings, interpolate, run, sequence, unit } from "tween-fn";

const convertTimestampToDatetimeLocalString = (t: number) => {
  const date = new Date(t);

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = "00";

  // Combine date-time components
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

const datetimeLocalToTimestamp = (formattedDate: string) => {
  const [datePart, timePart] = formattedDate.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  // Note: The month in the Date constructor is 0-indexed.
  const dateObj = new Date(year, month - 1, day, hour, minute);

  return dateObj.getTime();
};

type TFormInputs = {
  title: string;
  startDateTime: number;
  endDateTime: number;
  description: string;
  location: string;
};

const EditEntryForm = () => {
  const entryForm = useRef<HTMLFormElement | null>(null);
  const entryFormBackdrop = useRef<HTMLDivElement | null>(null);
  const { selectedItem, setSelectedItem, updateItem } = useContext(
    TimelineContext
  ) as NonNullable<ContextType<typeof TimelineContext>>;
  const form = useForm<TFormInputs>({
    defaultValues: {
      title: "",
      startDateTime: Date.now(),
      endDateTime: Date.now(),
      description: "",
      location: "",
    },
  });

  useEffect(() => {
    if (selectedItem === null) return;

    form.reset({
      title: selectedItem.title,
      description: selectedItem.description,
      startDateTime: selectedItem.start_time,
      endDateTime: selectedItem.end_time,
      location: selectedItem.location,
    });
  }, [selectedItem, form]);

  useEffect(() => {
    if (selectedItem === null) {
      const seq = sequence([
        unit({
          duration: 160,
          ease: easings.SQUARED,
          change: (y) => {
            const entryFormNode = entryForm.current as HTMLFormElement;
            const backdropNode = entryFormBackdrop.current as HTMLDivElement;
            Object.assign(entryFormNode.style, {
              opacity: `${interpolate(y, 1, 0)}`,
              transform: `translate(-50%, -50%) scale(${interpolate(
                y,
                1,
                0.9
              )})`,
            });
            Object.assign(backdropNode.style, {
              opacity: `${interpolate(y, 1, 0)}`,
            });
          },
          complete: () => {
            setSelectedItem(null);
          },
        }),
      ]);
      run(seq);
    } else {
      const seq = sequence([
        unit({
          duration: 160,
          ease: easings.SQUARED,
          change: (y) => {
            const entryFormNode = entryForm.current as HTMLFormElement;
            const backdropNode = entryFormBackdrop.current as HTMLDivElement;
            Object.assign(entryFormNode.style, {
              opacity: `${interpolate(y, 0, 1)}`,
              transform: `translate(-50%, calc(-50% + ${interpolate(
                y,
                10,
                0
              )}px))`,
            });
            Object.assign(backdropNode.style, {
              opacity: `${interpolate(y, 0.5, 1)}`,
            });
          },
        }),
      ]);
      run(seq);
    }
  }, [selectedItem, setSelectedItem]);

  const handleSubmit = useCallback(
    (values: TFormInputs) => {
      updateItem({
        ...selectedItem,
        title: values.title,
        location: values.location,
        start_time: values.startDateTime,
        start: values.startDateTime,
        end_time: values.endDateTime,
        end: values.endDateTime,
        description: values.description,
      });

      setSelectedItem(null);
    },
    [updateItem, selectedItem, setSelectedItem]
  );

  return (
    <div
      ref={entryFormBackdrop}
      onClick={() => setSelectedItem(null)}
      className={`pointer-events-${
        selectedItem === null ? "none" : "auto"
      } z-[9999] fixed top-0 left-0 w-screen h-screen bg-[rgba(0,0,0,0.5)]`}
    >
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        ref={entryForm}
        onClick={(e) => e.stopPropagation()}
        className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 flex flex-col gap-[32px] max-w-[calc(100%-30px)] w-[400px] p-[16px] rounded-[8px] bg-[#222325]"
      >
        <div className="flex flex-col gap-[16px]">
          <Controller
            control={form.control}
            name="title"
            render={({ field }) => (
              <input
                type="text"
                placeholder="title"
                className="border-0 bg-transparent text-[#fff] text-[32px] font-semibold"
                {...field}
              />
            )}
          />
          <Controller
            control={form.control}
            name="location"
            render={({ field }) => (
              <input
                type="text"
                placeholder="location"
                className="border-0 bg-transparent text-[#fff]"
                {...field}
              />
            )}
          />
          <div className="flex flex-row gap-[4px]">
            <Controller
              control={form.control}
              name="startDateTime"
              render={({ field: { value, onChange, ...field } }) => (
                <input
                  type="datetime-local"
                  placeholder="start date"
                  value={convertTimestampToDatetimeLocalString(value)}
                  onChange={(e) =>
                    onChange(datetimeLocalToTimestamp(e.target.value))
                  }
                  max={convertTimestampToDatetimeLocalString(
                    form.getValues().endDateTime
                  )}
                  className="border-0 bg-transparent text-[#fff]"
                  {...field}
                />
              )}
            />
            <Controller
              control={form.control}
              name="endDateTime"
              render={({ field: { value, onChange, ...field } }) => (
                <input
                  type="datetime-local"
                  placeholder="end date"
                  value={convertTimestampToDatetimeLocalString(value)}
                  onChange={(e) =>
                    onChange(datetimeLocalToTimestamp(e.target.value))
                  }
                  className="border-0 bg-transparent text-[#fff]"
                  {...field}
                />
              )}
            />
          </div>
          <Controller
            control={form.control}
            name="description"
            render={({ field }) => (
              <textarea
                placeholder="description"
                className="min-w-full max-w-full border-0 bg-transparent text-[#fff]"
                {...field}
              />
            )}
          />
        </div>
        <div className="flex flex-row justify-between">
          <button
            className="cursor-pointer h-[35px] px-[16px] text-[10px] uppercase leading-[35px] rounded-[8px] bg-[#000] text-[#fff]"
            onClick={() => {
              setSelectedItem(null);
            }}
          >
            {"Cancel"}
          </button>
          <button
            type="submit"
            className="cursor-pointer h-[35px] px-[16px] text-[10px] uppercase leading-[35px] rounded-[8px] bg-[#000] text-[#fff]"
          >
            {"Confirm"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEntryForm;
