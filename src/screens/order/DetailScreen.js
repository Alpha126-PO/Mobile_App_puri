import { View ,Text,ScrollView,StyleSheet,Dimensions,Pressable,FlatList} from 'react-native';
import { useState } from 'react';
import BillOrder from '../../component/BillOrder';


export default function DetailScreen({ navigation }) {
  
  const tableNumber = 5;
  const tableTime = '12.56'
  const orderamount = 7
  const billId = '#A-1042'

  const orders = [
    {
      round: 1,
      sentTime: '18:12',
      status: 'เสิร์ฟครบ',
      items: [
        { id: '1', name: 'ข้าวผัดกุ้ง', note: 'ธรรมดา', price: 120, qty: 2 },
        { id: '2', name: 'คะน้าน้ำมันหอย', note: 'ใส่หมูกรอบ', price: 105, qty: 1 },
      ]
    },
    {
      round: 2,
      sentTime: '18:52',
      status: 'กำลังทำ',
      items: [
        { id: '3', name: 'ผัดกะเพราหมูสับ', note: 'พิเศษ, ไข่ดาว', price: 120, qty: 2 },
        { id: '4', name: 'ข้าวสวย', note: '', price: 15, qty: 4 },
      ]
    },{
      round: 3,
      sentTime: '18:52',
      status: 'กำลังทำ',
      items: [
        { id: '3', name: 'ผัดกะเพราหมูสับ', note: 'พิเศษ, ไข่ดาว', price: 120, qty: 2 },
        { id: '4', name: 'ข้าวสวย', note: '', price: 15, qty: 4 },
      ]
    },{
      round: 4,
      sentTime: '18:52',
      status: 'กำลังทำ',
      items: [
        { id: '3', name: 'ผัดกะเพราหมูสับ', note: 'พิเศษ, ไข่ดาว', price: 120, qty: 2 },
        { id: '4', name: 'ข้าวสวย', note: '', price: 15, qty: 4 },
      ]
    },{
      round: 5,
      sentTime: '18:52',
      status: 'กำลังทำ',
      items: [
        { id: '3', name: 'ผัดกะเพราหมูสับ', note: 'พิเศษ, ไข่ดาว', price: 120, qty: 2 },
        { id: '4', name: 'ข้าวสวย', note: '', price: 15, qty: 4 },
      ]
    }
  ];

    return (
      <View style={styles.content}>
       
          <View style={styles.boxLeft}>
           
           
            <View style={{paddingBottom:16}}>
              <Text style={{fontSize:24,paddingBottom:12, paddingTop:20,fontWeight:'bold'}}>สรุปบิล {billId}</Text>
              <Text>โต้ะ {tableNumber} เปิด {tableTime} รอบ {orderamount} รายการ</Text>
            </View>
            <BillOrder orders={orders}/>
           
          </View>
          <View style={styles.boxRight}>

                <Text style={{fontSize:24,paddingBottom:12, paddingTop:20,fontWeight:'bold'}} >ยอดที่ต้องชำระ</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom:10}}>
                  <Text  style={{fontSize:18,color: '#42544A'}}>รวมค่าอาหาร</Text>
                  <Text  style={{fontSize:18,color: '#42544A',fontWeight:'bold'}}>฿1,231 </Text>
                </View>
               
                <View style={{flexDirection:'row', justifyContent: 'space-between', paddingBottom:10 }}>
                
                        <Text style={{fontSize:18,color: '#42544A'}}>ค่าบริการ 10%</Text>
                       <Text  style={{fontSize:18,color: '#42544A',fontWeight:'bold'}}>฿121 </Text>
                  
                 
                   
                </View>
                <View style={{flexDirection:'row', justifyContent: 'space-between' , paddingBottom:10}}>
                       <Text  style={{fontSize:18,color: '#42544A'}}>ภาษีมูลค่าเพิ่ม 7% </Text>
                       <Text  style={{fontSize:18,color: '#42544A',fontWeight:'bold'}} >฿70 </Text>
                  
                </View>
                <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E0EDE4', paddingTop:20 }}/>

                <View style={{flexDirection:'row', justifyContent: 'space-between', paddingTop:20 }}>
                  <Text style={{fontSize:24,fontWeight:'bold'}}>ยอดรวมทั้งบิล</Text>
                  <Text style={{fontSize:30,fontWeight:'bold'}} >฿1,250</Text>
                </View>


                <View  style={{borderWidth:1,borderColor:'#E0EDE4',borderRadius:20,backgroundColor:'#fff',marginTop:20}}>
                  <View style={{padding:30}}>
                    <Text style={{fontSize:14, fontWeight:'bold'}}>ชำระที่เคาน์เตอร์</Text>
                    <View style={{paddingTop:10}}>
                        <Text style={{fontSize:14,color: '#42544A'}}>แจ้งเลขบิล {billId} ที่เคาน์เตอร์ หนักงานจะปิดบิลและออกใบเสร็จให้</Text>
                    </View>
                  </View>
                
                </View>
            <View style={{paddingTop:140}}>
                    <Pressable style={{borderRadius:20,backgroundColor:'#16281F',marginTop:20}}  onPress={() => navigation.navigate('Bill' )} >
                      <View style={{justifyContent:'center',alignItems:'center',padding:30}}>
                            <Text style={{fontSize:20,fontWeight:'bold',color:'#fff'}}>พิมพ์ใบเสร็จเป็นไฟล์</Text>
                      </View>

                    </Pressable>
                    <Pressable style={{borderRadius:20,backgroundColor:'#FAFDF7',marginTop:20 ,borderColor:'#E0EDE4',borderWidth:1}} onPress={() => navigation.navigate('MenuScreen' )}>
                      <View style={{justifyContent:'center',alignItems:'center',padding:30}}>
                            <Text style={{fontSize:20,fontWeight:'bold',color:'#42544A'}}>สั่งเพิ่ม</Text>
                      </View>

                    </Pressable>

                    <Pressable  onPress={console.log("เก็บเงินโต๊ะ "+tableNumber)}>
                      <View style={{paddingTop:20}}>
                            <Text style={{textAlign:'center'}}> เรียกพนักงานมาเก็บเงินที่โต๊ะ </Text>
                      </View>
                      
                    </Pressable>
            </View>
              


          </View>
      </View>
    );
  }


export const styles = StyleSheet.create({

  content:{
    flex: 1,
    backgroundColor: '#fff',
    flexDirection:'row'
  },
  boxLeft:{
    flex: 6,
   
    paddingLeft:20
  },
  boxRight:{
    flex:4,
    backgroundColor: '#FAFDF7',
    borderColor:'blue',
    paddingHorizontal:20,
    borderLeftWidth:1,
    borderLeftColor: '#E0EDE4',
   
    
  },

})