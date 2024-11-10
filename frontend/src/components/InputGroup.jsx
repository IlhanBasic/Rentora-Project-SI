export default function InputGroup({inputId,inputName,inputType}){
    return <div className="input-group">
        <label htmlFor={inputId}>{inputName}</label>
        <input type={inputType} name={inputId} autoComplete="new-password"/>
    </div>
}