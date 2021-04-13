import React from 'react';

const filter = (props) => { 
  
  const ops = props.options.map((item,i) => {
    return ( 
      <option key={i} label={item} value={item} />
    ); 
  });
  
    return (
        <>
          <div className = "pickerView">
          <p className = "ftext">{props.title}</p>
          <select  
              className="fselect"
              onChange = {e => props.filter(e.target.value)}>
              {ops} 
          </select>
          </div> 
        </> 
    )
}   
 
export default filter