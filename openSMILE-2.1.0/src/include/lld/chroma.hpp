/*F***************************************************************************
 * openSMILE - the open-Source Multimedia Interpretation by Large-scale
 * feature Extraction toolkit
 * 
 * (c) 2008-2011, Florian Eyben, Martin Woellmer, Bjoern Schuller: TUM-MMK
 * 
 * (c) 2012-2013, Florian Eyben, Felix Weninger, Bjoern Schuller: TUM-MMK
 * 
 * (c) 2013-2014 audEERING UG, haftungsbeschränkt. All rights reserved.
 * 
 * Any form of commercial use and redistribution is prohibited, unless another
 * agreement between you and audEERING exists. See the file LICENSE.txt in the
 * top level source directory for details on your usage rights, copying, and
 * licensing conditions.
 * 
 * See the file CREDITS in the top level directory for information on authors
 * and contributors. 
 ***************************************************************************E*/


/*  openSMILE component:

Component to compute chroma features from a semi-tone spectrum. 

This component is based on original code from Moritz Dausinger (wave2chroma). 
The openSMILE chroma component was implemented by Christoph Kozielski.

*/


#ifndef __CCHROMA_HPP
#define __CCHROMA_HPP

#include <core/smileCommon.hpp>
#include <core/vectorProcessor.hpp>

#define BUILD_COMPONENT_Chroma
#define COMPONENT_DESCRIPTION_CCHROMA "This component computes CHROMA features from a semi-tone scaled spectrum generated by the 'cTonespec' component."
#define COMPONENT_NAME_CCHROMA "cChroma"

#undef class
class DLLEXPORT cChroma : public cVectorProcessor {
  private:
	  FLOAT_DMEM silThresh;
    int octaveSize;
    int nOctaves;

  protected:
    SMILECOMPONENT_STATIC_DECL_PR

    virtual void fetchConfig();
    //virtual int myConfigureInstance();
    //virtual int myFinaliseInstance();
    //virtual int myTick(long long t);
	

    //virtual void configureField(int idxi, long __N, long nOut);
    virtual int setupNamesForField(int i, const char*name, long nEl);
    //virtual int processVectorInt(const INT_DMEM *src, INT_DMEM *dst, long Nsrc, long Ndst, int idxi);
    virtual int processVectorFloat(const FLOAT_DMEM *src, FLOAT_DMEM *dst, long Nsrc, long Ndst, int idxi);

  public:
    SMILECOMPONENT_STATIC_DECL
    
    cChroma(const char *_name);

    virtual ~cChroma();
};




#endif // __CCHROMA_HPP
