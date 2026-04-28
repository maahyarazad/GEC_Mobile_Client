import './OfferPreview.css'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import discountIcon from '../../assets/Discount_Stamp.png'
import buygetIcon from '../../assets/Special_Offer_Stamp.png'
import freebieIcon from '../../assets/Freebie.png'
import moment from 'moment'

interface Props {
    color: string;
    product: string | undefined | null;
    premium: string;
    freebie?: string;
    prep: string;
    type: number | null;
    endDate: Date | Date[] | undefined;
    hotpick: boolean;
}

//Functional Component
const OfferPreview: React.FC<Props> = ({type, color, product, premium, freebie, prep, endDate, hotpick}) => {
    const [offerIcon, setOfferIcon] = useState<string | null>(null)
    const outputContainerRef = useRef<HTMLDivElement>(null)
    const [fontSize, setFontSize] = useState<number>(18)

    useEffect(()=>{
        switch(type){
            case 0: setOfferIcon(discountIcon); break;
            case 1: setOfferIcon(buygetIcon); break;
            case 2: setOfferIcon(freebieIcon); break;
            default: setOfferIcon(null)
        }
    }, [premium])


    useLayoutEffect(()=>{
        if(outputContainerRef.current != undefined){
        const output = outputContainerRef.current;
        if(output.clientHeight > 41){
            setFontSize(fontSize-1)
        }
        }
    }, [product])

    return (
        <>
        <div className="h-5rem w-25rem border-round relative" style={{backgroundColor: color}}>
                <div className="half-circle-top ml-8 absolute top-0"></div>
                <div className="half-circle-bottom ml-8 absolute bottom-0"></div>
                <div className='ticket-cut absolute h-full w-min'></div>
                { hotpick && 
                    <div className='ribbon-container'>
                        <div className="ribbon">
                            <div className="ribbon-content">
                            Hot Pick
                            </div>
                            <div className="ribbon-ends">
                                <div>
                                </div>
                                <div>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                <div className="absolute top-0 ml-8 pl-5 pt-2  h-full text-medium font-medium">
                    {`${premium ? premium : ''} ${freebie} ${premium ? prep : ''}`}
                </div>
                <div className="absolute ml-8 pl-5 align-items-center flex w-19rem h-full text-base font-bold text-left  ">
                    <div style={{fontSize: `${fontSize}px`}} ref={outputContainerRef} className=' w-full '>
                        {product}
                    </div>
                </div>
                <div className='absolute right-0 bottom-0 mx-2 my-1 text-xs'>
                    valid until {endDate && endDate !== undefined && !Array.isArray(endDate) ? moment(endDate.toLocaleDateString()).format('D-MMM, Y') : ''}
                </div>
                <div className='absolute h-full flex align-items-center ml-2'>
                    <img className={`offer-icons ${offerIcon ? 'block' : 'hidden'}`} src={offerIcon!} alt={'offer stamp'}/>
                </div>
        </div>
        </>
    )
}

export default OfferPreview