class Animations {
    static playSound(id, loop) {
        return createjs.Sound.play(id, createjs.Sound.INTERRUPT_EARLY, 0, 0, loop);
    }
}


class Animation{
    constructor(compNum, folderName, libName) {
        this.canvas = document.getElementById("canvas");
        this.stage = {};
        this.exportRoot = {};
        this.anim_container = {};
        this.dom_overlay_container = {};
        this.lib = {};
        this.compNum = compNum;
        this.folderName = folderName;
        this.libName = libName;
    }

    init() {
        this.anim_container = document.getElementById("animation_container");
        this.dom_overlay_container = document.getElementById("dom_overlay_container");
        var comp=AdobeAn.getComposition(this.compNum);
        this.lib=comp.getLibrary();
        createjs.MotionGuidePlugin.install();
        var loader = new createjs.LoadQueue(false);
        loader.installPlugin(createjs.Sound);
        var thisObj = this;

        loader.addEventListener("fileload", function(evt){thisObj.handleFileLoad(evt,comp)});
        loader.addEventListener("complete", function(evt){thisObj.handleComplete(evt,comp)});
        //this.lib=comp.getLibrary();

        var folderName = this.folderName;
        this.lib.properties.manifest.forEach(function(file) {
            file.src = 'CutScenes/' + folderName + '/'+ file.src
            console.log(file.src);
        });

        loader.loadManifest(this.lib.properties.manifest);
    }
    handleFileLoad(evt, comp) {
        var images=comp.getImages();
        if (evt && (evt.item.type == "image")) { images[evt.item.id] = evt.result; }
    }
    handleComplete(evt,comp) {
        //This function is always called, irrespective of the content. You can use the variable "stage" after it is created in token create_stage.
        //var lib=comp.getLibrary();
        var ss=comp.getSpriteSheet();
        var queue = evt.target;
        var ssMetadata = this.lib.ssMetadata;
        for(var i=0; i<ssMetadata.length; i++) {
            ss[ssMetadata[i].name] = new createjs.SpriteSheet( {"images": [queue.getResult(ssMetadata[i].name)], "frames": ssMetadata[i].frames} )
        }
        //this.exportRoot = new this.lib.intro();
        var temp = this.lib[this.libName];
        this.exportRoot = new temp();
        this.stage = new this.lib.Stage(this.canvas);
        //Registers the "tick" event listener.
        this.makeResponsive(false,'both',false,1);
        AdobeAn.compositionLoaded(this.lib.properties.id);
        this.fnStartAnimation(this);
    }
    //Code to support hidpi screens and responsive scaling.
    makeResponsive(isResp, respDim, isScale, scaleType) {
        var lastW, lastH, lastS=1;
        var thisObj = this;
        window.addEventListener('resize', function(){thisObj.resizeCanvas(isResp)});
        this.resizeCanvas();

    }
    resizeCanvas(isResp) {
        var w = this.lib.properties.width, h = this.lib.properties.height;
        var iw = window.innerWidth, ih=window.innerHeight;
        var pRatio = window.devicePixelRatio || 1, xRatio=iw/w, yRatio=ih/h, sRatio=1;
        if(isResp) {
            if((respDim=='width'&&lastW==iw) || (respDim=='height'&&lastH==ih)) {
                sRatio = lastS;
            }
            else if(!isScale) {
                if(iw<w || ih<h)
                    sRatio = Math.min(xRatio, yRatio);
            }
            else if(scaleType==1) {
                sRatio = Math.min(xRatio, yRatio);
            }
            else if(scaleType==2) {
                sRatio = Math.max(xRatio, yRatio);
            }
        }
        this.canvas.width = w*pRatio*sRatio;
        this.canvas.height = h*pRatio*sRatio;
        this.canvas.style.width = this.dom_overlay_container.style.width = this.anim_container.style.width =  w*sRatio+'px';
        this.canvas.style.height = this.anim_container.style.height = this.dom_overlay_container.style.height = h*sRatio+'px';
        this.stage.scaleX = pRatio*sRatio;
        this.stage.scaleY = pRatio*sRatio;
        var lastW = iw;
        var lastH = ih;
        var lastS = sRatio;
        this.stage.tickOnUpdate = false;
        this.stage.update();
        this.stage.tickOnUpdate = true;
    }
    fnStartAnimation() {
        this.stage.addChild(this.exportRoot);
        createjs.Ticker.setFPS(this.lib.properties.fps);
        createjs.Ticker.addEventListener("tick", this.stage);
    }
}