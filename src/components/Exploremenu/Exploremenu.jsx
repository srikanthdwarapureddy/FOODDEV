import React from 'react'
import './Exploremenu.css'
import { menu_list } from '../../assets/assets'


const Exploremenu = ({category,setCategory}) => {
  return (
    <div className='Explore-menu' id='explore-menu'>
        <h1>Explore our menu</h1>
        <div className='Explore-menu-text'>
        <p>
            Explore our menu and order what do u want from our kichen it was very reasonble

        </p>
        </div>
        <div className='Explore-menu-list'>
            {menu_list.map((item,index)=>{
                return(
                    <div onClick={()=>setCategory(prev=>prev===item.menu_name?"All":item.menu_name)} key={index} className='Explore-menu-list-items'>
                        <img className={category===item.menu_name?"active":""} src={item.menu_image} alt="" />
                        <p>{item.menu_name}</p>
                        <div>
                <hr/>
            </div>

                    
                    </div>
                )
            })}
            


        </div>
    </div>
  )
}

export default Exploremenu