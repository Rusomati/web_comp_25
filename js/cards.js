function viewInteractManager(thresholdd, classN, onInit, onLoad, onUnload){ //eh name
    const DOMTargets = document.getElementsByClassName(classN);
    const loadObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.intersectionRatio >= thresholdd){
                onLoad(entry.target);
            }
            else{
                onUnload(entry.target);
            }
        });
    }, {threshold: [0.0, thresholdd]});
    
    [...DOMTargets].forEach(element => {
        loadObs.observe(element);
        onInit(element);
    });

    //to return a cleanup function
    return () => {
        loadObs.disconnect();
    };
}

viewInteractManager(0.7, 'animLoad', 
    (element) => {element.classList.remove('animShow');},
    (element) => {element.classList.add('animShow');},
    () => {}
);