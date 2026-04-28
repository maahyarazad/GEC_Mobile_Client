
import './Main.css';
import React, { FC, useEffect } from 'react';
import Header from '../components/Header/Header';
import PageContainer from '../components/PageContainer';
import { StorageService } from '../services/Storage/Storage.service';
import { useNavigate } from 'react-router-dom';
import TitleManager from '../components/TitleManager';
const Main:FC = () => {
    
    return (
        <TitleManager>
            <Header />
            <PageContainer/>
            
        </TitleManager>
    )
}

export default Main;