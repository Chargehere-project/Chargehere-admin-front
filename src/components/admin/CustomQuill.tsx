// CustomQuill.tsx
import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

// ReactQuill을 동적 로드하고 any 타입으로 캐스팅
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface CustomQuillProps {
    value: string;
    onChange: (content: string) => void;
    modules?: any;
    formats?: any;
}

const CustomQuill = forwardRef((props: CustomQuillProps, ref) => {
    const quillRef = useRef<any>(null);

    // useImperativeHandle을 사용하여 외부에서 접근 가능한 getEditor 메서드를 제공합니다.
    useImperativeHandle(ref, () => ({
        getEditor: () => quillRef.current?.getEditor(),
    }));

    // value prop이 변경될 때 에디터 값 업데이트
    useEffect(() => {
        if (quillRef.current) {
            const editor = quillRef.current.getEditor();
            if (editor.getText() !== props.value) {
                editor.setText(props.value); // value가 변경되면 에디터에 반영
            }
        }
    }, [props.value]);

    return (
        <ReactQuill
            ref={quillRef}
            value={props.value}
            onChange={props.onChange}
            modules={props.modules}
            formats={props.formats}
        />
    );
});

CustomQuill.displayName = 'CustomQuill';

export default CustomQuill;
