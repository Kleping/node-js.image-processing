import { StyleSheet, Text, View, Button, Dimensions, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { BlurView } from 'expo-blur';
import axios from 'axios';

export default class SecondaryApp extends React.Component {

    constructor(props) {
        super(props);
        this.renderContent = this.renderContent.bind(this);
        this.setStateAsync = this.setStateAsync.bind(this);

        this.state = {
            capturedImage: undefined,
            resizedCaptureImage: ''
        };
    }

    setStateAsync(state) {
        return new Promise(resolve => {
            this.setState(state, () => resolve());
        });
    }

    async captureImage() {
        try {
            const permission = await ImagePicker.requestCameraPermissionsAsync();

            if (!permission.granted) {
                return;
            }

            const capturedImage = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: .1,
                base64: true,
            });

            await this.setStateAsync({
                capturedImage,
                resizedCaptureImage: null,
            });

            const url = 'https://507f191e810c19729de860ea.loca.lt/upload';
            let response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ capturedImage: capturedImage.base64 }),
            });
            response = await response.json();
            await this.setStateAsync({
                resizedCaptureImage: {uri: `data:image/png;base64,${response.content}`},
            })
        }
        catch(error) {
            console.log(error)
        }
    }

    renderContent() {

        if (this.state.capturedImage && !this.state.resizedCaptureImage) {
            const styles = StyleSheet.create({
                view: {
                    flex: 1,
                }
            });

            return (
                <View style={styles.view}>

                </View>
            );
        }

        return (
            <TouchableOpacity
                onPress={() => this.captureImage()}
                style={styles.touchable}
            >
                <Text style={styles.text}>Capture an Image</Text>
            </TouchableOpacity>
        );
    }

    render() {
        let source = undefined;
        const capturedImage = this.state.capturedImage;
        const resizedCapturedImage = this.state.resizedCaptureImage;
        if (resizedCapturedImage) {
            source = resizedCapturedImage;
        }
        else if (capturedImage) {
            source = {uri: capturedImage.uri};
        }

        return (
            <View style={styles.container}>
                <Image source={source} style={styles.img}/>
                <BlurView intensity={100} tint={'dark'} style={styles.blurView}>
                    {this.renderContent()}
                </BlurView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    },
    blurView: {
        position: 'absolute', left: 0, right: 0, bottom: 0,
        height: Dimensions.get('window').height * .15,
    },
    touchable: {
        flex: 1,

        paddingTop: Dimensions.get('window').height * .025,
        // backgroundColor: 'gray',
    },
    text: {
        textAlign: 'center',
        letterSpacing: 2,
        fontSize: 20,
        color: 'white',
    },
    img: {
        // backgroundColor: 'gray',
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    }
});
