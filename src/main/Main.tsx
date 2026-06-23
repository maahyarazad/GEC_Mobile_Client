
import './Main.css';
import React, { FC } from 'react';
import Header from '../components/Header/Header';
import PageContainer from '../components/PageContainer';
import Navbar from '../components/Navbar';
import TitleManager from '../components/TitleManager';

const Main: FC = () => {
    return (
        <TitleManager>
            <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
                <Navbar />
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                    <Header />
                    <PageContainer />
                </div>
            </div>
        </TitleManager>
    )
}

export default Main;
