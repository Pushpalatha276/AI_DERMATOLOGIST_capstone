
import React from "react";
export default function Nav({ current, setCurrent }){
  const tabs = ["Dashboard","History","Profile","About"];
  return (
    <div className="nav" style={{margin:"10px 0 18px"}}>
      {tabs.map(t=>(
        <button key={t} className="btn" style={{fontWeight: current===t ? 700 : 500}} onClick={()=>setCurrent(t)}>{t}</button>
      ))}
    </div>
  );
}
