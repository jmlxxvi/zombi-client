(async () => {

   INDEX.i18n.apply();

    

    // import { Plugins } from '@capacitor/core';

    // const { Storage } = Plugins;


    // // JSON "set" example
    // const setObject = async () => {
    // await Storage.set({
    //     key: 'user',
    //     value: JSON.stringify({
    //     id: 1,
    //     name: 'Max'
    //     })
    // });
    // }

    // // JSON "get" example
    // const getObject = async () => {
    // const ret = await Storage.get({ key: 'user' });
    // const user = JSON.parse(ret.value);
    // }

    // const setItem = async ()  => {
    // await Storage.set({
    //     key: 'name',
    //     value: 'Max'
    // });
    // }

    // const getItem = async ()  => {
    // const { value } = await Storage.get({ key: 'name' });
    // console.log('Got item: ', value);
    // }

    // const removeItem = async  () => {
    // await Storage.remove({ key: 'name' });
    // }

    // const keys = async () => {
    // const { keys } = await Storage.keys();
    // console.log('Got keys: ', keys);
    // }

    // const clear = async () => {
    // await Storage.clear();
    // }

$("#apretame").on("click", e => {

    e.preventDefault();

    console.log("apretame!");

    // setObject();

    // console.log(getObject());

});
   



})();
