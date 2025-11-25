import React, { forwardRef } from "react";

export interface InputWithDataListProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  datalist?: {
    listId: string;
    suggestions: string[];
  };
}

function Input(
  { datalist, ...props }: InputWithDataListProps,
  ref: React.Ref<HTMLInputElement>
) {
  return (
    <>
      <input ref={ref} list={datalist?.listId} {...props} />
      {datalist && datalist.suggestions?.length > 0 && (
        <datalist id={datalist.listId}>
          {(datalist.suggestions || []).map((item, index) => (
            <option key={index} value={item}>
              {item}
            </option>
          ))}
        </datalist>
      )}
    </>
  );
}

export default forwardRef(Input);
