import DefaultTheme from 'vitepress/theme'
import '../styles/index.scss'

import AllPages from '../../components/AllPages.vue'
import AnnoAttachment from '../../components/AnnoAttachment.vue'
import AnnoForms from '../../components/AnnoForms.vue'
import AnnoLinks from '../../components/AnnoLinks.vue'
import AnnotationFilter from '../../components/AnnotationFilter.vue'
import AnnotationLayer from '../../components/AnnotationLayer.vue'
import FitParent from '../../components/FitParent.vue'
import Loaded from '../../components/Loaded.vue'
import MultiplePDF from '../../components/MultiplePDF.vue'
import OnePage from '../../components/OnePage.vue'
import Rotation from '../../components/Rotation.vue'
import Scale from '../../components/Scale.vue'
import TextLayer from '../../components/TextLayer.vue'
import XFALayer from '../../components/XFALayer.vue'
import Watermark from '../../components/Watermark.vue'
import TOC from '../../components/TOC.vue'
import HighlightText from '../../components/HighlightText.vue'
import TextHighlight from '../../components/TextHighlight.vue'
import TextLoaded from '../../components/TextLoaded.vue'
import AnnotationLoaded from '../../components/AnnotationLoaded.vue'
import XFALoaded from '../../components/XFALoaded.vue'

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('OnePage', OnePage)
    app.component('Watermark', Watermark)
    app.component('AllPages', AllPages)
    app.component('Scale', Scale)
    app.component('Rotation', Rotation)
    app.component('TextLayer', TextLayer)
    app.component('AnnotationLayer', AnnotationLayer)
    app.component('XFALayer', XFALayer)
    app.component('FitParent', FitParent)
    app.component('AnnotationFilter', AnnotationFilter)
    app.component('MultiplePDF', MultiplePDF)
    app.component('AnnoAttachment', AnnoAttachment)
    app.component('AnnoForms', AnnoForms)
    app.component('AnnoLinks', AnnoLinks)
    app.component('Loaded', Loaded)
    app.component('TOC', TOC)
    app.component('HighlightText', HighlightText)
    app.component('TextHighlight', TextHighlight)
    app.component('TextLoaded', TextLoaded)
    app.component('AnnotationLoaded', AnnotationLoaded)
    app.component('XFALoaded', XFALoaded)
  },
}
