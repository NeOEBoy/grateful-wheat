import React from 'react';

class TestVideo extends React.Component {


    render() {
        return (
            <div>
                <video
                    width={500}
                    height={500}
                    id="video-player"
                    autoPlay
                    controls
                    loop
                    src="/生日蛋糕/图册/6-男孩&男生系列/小王子小公主_40_logo.mp4"
                />
            </div>
        );
    }
}

export default TestVideo;


