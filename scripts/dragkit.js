class kitTabManager{
    constructor(){
        this.currentKitTab = null
        this.kitTabs = new Map()
        this.kitTabButtons = new Map()
        this.kitActive = true
        this.init()
    }
    
    init(){
        const kitTabElements = document.querySelectorAll('.kit-tab')
        const kitTabButtonElements = document.querySelectorAll('.kit-button')
        const kitHideBtn = document.querySelector('.kit-hide-button')

        kitTabButtonElements.forEach(ktb => {
            if(ktb.id){
                const tabID = ktb.id.substring(6)
                this.kitTabButtons.set(tabID, ktb)
                ktb.addEventListener('click', () => this.switchTab(tabID))
            }
        })
        
        kitTabElements.forEach(kt => {
            if(kt.id){
                this.kitTabs.set(kt.id, kt)
                kt.classList.add('hidden')
            }
        })

        if(kitHideBtn) {
            kitHideBtn.addEventListener('click', () => {
                this.toggleKit()
            })
        }
    }
    
    switchTab(tabID){
        const targetTab = this.kitTabs.get(tabID)
        if(!targetTab) return

        // when the same tab close it 
        if(this.currentKitTab === tabID){
            targetTab.classList.add('hidden')
            this.currentKitTab = null
            return
        }
        
        if(this.currentKitTab){
            const currentTab = this.kitTabs.get(this.currentKitTab)
            if(currentTab) {
                currentTab.classList.add('hidden')
            }
        }
        
        targetTab.classList.remove('hidden')
        this.currentKitTab = tabID
    }
    
    toggleKit(){
        const kitHideIcon = document.querySelector('.kit-hide-icon')
        const kitCont = document.querySelector('.kit-button-container')

        kitHideIcon.classList.toggle('fa-chevron-right')
        kitHideIcon.classList.toggle('fa-chevron-left')
        kitCont.classList.toggle('slideout')
        
        this.kitActive = !this.kitActive
        
        // when the kit close any open tab
        if(!this.kitActive && this.currentKitTab){
            const currentTab = this.kitTabs.get(this.currentKitTab)
            if(currentTab) {
                currentTab.classList.add('hidden')
            }
            this.currentKitTab = null
        }
    }
}

const kit_tab_manager = new kitTabManager()

