import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {

  const [offerings, setOfferings] = useState({})
  
  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get('http://127.0.0.1:8000/api/catalog/offerings/');
      console.log(response.data);
      setOfferings(response.data); 
    }
    fetchData();
  },[]);

  return (
    <>
      <p>{JSON.stringify(offerings)}</p>
    </>
  )
}

export default App
