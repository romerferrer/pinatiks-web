import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function fetchOfferings(){
  console.log(axios.get('http://127.0.0.1:8000/api/catalog/offerings/'))
};

function App() {

  useEffect(
    fetchOfferings
    , [])

  return (
    <>
    </>
  )
}

export default App
