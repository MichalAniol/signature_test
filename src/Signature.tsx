import React, { useCallback } from 'react';
import { useRef } from 'react';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Pressable, StyleSheet, Text, View } from 'react-native';



interface IProps {
    setScrollEnabled: (value: boolean) => void,
}

const Button = ({ text, onPress }: { text: string, onPress: () => void }) => {
    return (
        <Pressable onPress={onPress}>
            <View style={[styles.button, { backgroundColor: 'green' }]}>
                <Text>{text}</Text>
            </View>
        </Pressable>
    )
}

export const Signature = ({ setScrollEnabled }: IProps) => {
    const signatureRef = useRef<WebView>(null)

    const setJsWV = (data: string) => signatureRef.current?.injectJavaScript(data)

    const onWebViewMessageHandler = useCallback(
        (e: WebViewMessageEvent) => {
            const webviewMessage = e.nativeEvent?.data?.split('_###_')
            const actionType = webviewMessage?.[0]
            const contextData = webviewMessage?.[1]
            switch (actionType) {
                case 'start': {
                    setScrollEnabled(false)
                    console.log('scroll: FALSE')
                } break
                case 'end': {
                    setScrollEnabled(true)
                    console.log('scroll: TRUE')
                } break
                case 'base64': {
                    // contextData
                    console.log('%c contextData:', 'background: #ffcc00; color: #003300', contextData)
                } break
            }
        },
        [],
    );

    const clearSignature = () => {
        setJsWV(`clear();true;`)
    }

    const getSignature = () => {
        setJsWV(`getBase64();true;`)
    }

    const onMapLoadEndHandler = () => { }

    return (
        <View>
            <WebView
                style={styles.webView}
                originWhitelist={['*']}
                scalesPageToFit={false}
                scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                onLoadEnd={onMapLoadEndHandler}
                source={{
                    html: `<!DOCTYPE html>
                    <html lang="nl-NL">
                        <head>
                            <meta http-equiv="Content-Type" content="text/html;  charset=utf-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1">
                            <title>1</title>
                            <style>
                                html {
                                    overflow: hidden;
                                }
                                body {
                                    margin: 0;
                                    padding: 0;
                                    overflow: hidden;
                                }
                            </style>
                        </head>
                        <body>
                            <canvas id="canvas"></canvas>
                            <script>
                                const canvas = document.getElementById('canvas');
                                canvas.width = window.innerWidth;
                                canvas.height = window.innerHeight;
                                const context = canvas.getContext("2d");
                                context.strokeStyle = 'red';
                                context.lineCap = "round";
                                const line = {
                                    min: 1,
                                    max: 5,
                                    scale: .2,
                                };
                                const pos = {
                                    x: 0,
                                    y: 0,
                                };
                                const lastPos = {
                                    x: 0,
                                    y: 0,
                                };
                                const size = Math.min(window.innerWidth, window.innerHeight);
                                const draw = (touch) => {
                                    if (touch) {
                                        lastPos.x = pos.x;
                                        lastPos.y = pos.y;
                                        pos.x = touch.pageX;
                                        pos.y = touch.pageY;
                                        const dx = lastPos.x - pos.x;
                                        const dy = lastPos.y - pos.y;
                                        let lineWidth = (size / Math.sqrt(dx * dx + dy * dy)) * line.scale;
                                        if (lineWidth > line.max)
                                            lineWidth = line.max;
                                        if (lineWidth < line.min)
                                            lineWidth = line.min;
                                        context.lineWidth = lineWidth;
                                        context.beginPath();
                                        context.moveTo(lastPos.x, lastPos.y);
                                        context.lineTo(pos.x, pos.y);
                                        context.stroke();
                                    }
                                };
                                canvas.addEventListener("touchstart", (event) => {
                                    const touches = event.targetTouches;
                                    if (touches[0]) {
                                        pos.x = touches[0].pageX;
                                        pos.y = touches[0].pageY;
                                    }
                                    window.ReactNativeWebView.postMessage('start_###_');
                                });
                                canvas.addEventListener("touchmove", (event) => {
                                    const touches = event.targetTouches;
                                    draw(touches[0]);
                                });
                                canvas.addEventListener("touchend", (event) => {
                                    const touches = event.targetTouches;
                                    draw(touches[0]);
                                    window.ReactNativeWebView.postMessage('end_###_');
                                });
                                const getBase64 = () => {
                                    const base64Image = canvas.toDataURL();
                                    window.ReactNativeWebView.postMessage('base64_###_' + base64Image);
                                };
                                const clear = () => context.clearRect(0, 0, window.innerWidth, window.innerHeight);
                            </script>
                        </body>
                    </html>`,
                    // baseUrl: isIOS ? '' : 'file:///android_asset/',
                }}
                javaScriptEnabled={true}
                ref={signatureRef}
                onMessage={onWebViewMessageHandler}
            />
            <View style={styles.innerContainer}>
                <Button text='save' onPress={getSignature} />
                <Button text='clear' onPress={clearSignature} />
            </View>
        </View>)
}

const styles = StyleSheet.create({
    webView: {
        width: 345,
        height: 170,
        backgroundColor: 'grey',
        marginBottom: 12,
    },
    innerContainer: {
        display: 'flex',
        flexDirection: 'row',
        width: 300,
    },
    button: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: 50,
        height: 30,
        borderRadius: 6,
        marginRight: 6,
    },
});