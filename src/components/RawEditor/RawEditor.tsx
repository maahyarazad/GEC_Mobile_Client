import React, {
  forwardRef,
  useRef,
  useState,
  useImperativeHandle
} from "react";
import Editor from "./Editor";
import PropTypes from "prop-types";

export interface RawEditorProps {
  height: number;
  value?: string;
  readOnly?: boolean;
  onTextChange?: (event: any, editor: any) => void;
  onSelectionChange?: (range: any, source: any, editor: any) => void;
}




export interface RawEditorRef {
  getHTML: () => string;
  getEditor: () => any;
}

const RawEditor = forwardRef<RawEditorRef, RawEditorProps>(
  ({ height, value = "", readOnly = false, onTextChange, onSelectionChange }, ref) => {
    const quillRef = useRef<any>(null);
    const [range, setRange] = useState<any>(null);

    useImperativeHandle(ref, () => ({
      getHTML: () => quillRef.current?.root.innerHTML || "",
      getEditor: () => quillRef.current,
    }));

    const editor_container_style = {
      height: height + 70,
    };

    return (
      <div className="w-full overflow-hidden" style={editor_container_style}>
        <Editor
          ref={quillRef}
          readOnly={readOnly}
          htmlValue={value}
          onTextChange={(event: any, editor: any) => {
            onTextChange?.(event, editor);
          }}
          onSelectionChange={(range: any, source: any, editor: any) => {
            setRange(range);
            onSelectionChange?.(range, source, editor);
          }}
        />
      </div>
    );
  }
);


export default RawEditor;
