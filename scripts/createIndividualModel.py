lib_svm_path = '/home/sinduran/Downloads/libsvm-3.20/python'
import sys
import os
import re
import tempfile
import subprocess
from subprocess import Popen
from subprocess import PIPE
sys.path.append(lib_svm_path)
from svmutil import *

config_file = '/home/sinduran/Downloads/openSMILE-2.2rc1/config/gemaps/GeMAPSv01a.conf'
scale_file = '/home/sinduran/testFolder/scale_file'

#trains the model using the data file and saves it to modelpath
def trainModel(dataFilePath,modelFilePath):
  # Read data in LIBSVM format
  y, x = svm_read_problem(dataFilePath)
  model = svm_train(y,x,"-s 4 -t 2 -g 0.0315 -c 115.5 -n 0.29 -e 0.007975")
  svm_save_model(modelFilePath, model)
  
#runs opensmile on wav_file and writes output to out_file
def openSmile(wav_file,out_file):
  FNULL = open(os.devnull, 'w')
  subprocess.call(['SMILExtract',"-C",str(config_file),"-I",str(wav_file),"-O",str(out_file)],stdout=FNULL, stderr=subprocess.STDOUT)

#removes unneccessary info from in_file and prepares data to be in readable from for libsvm
#and appends it to processed_file
def processOpenSmile(hr,inFile,processedFile):
    line = None;
    f = open(scale_file,'r')
    scale_lines = f.readlines()
    f.close()
    with inFile as cur_file:
      line = edit(cur_file);
      if(line != None):
        write(processedFile,line,scale_lines,hr)    

#returns line if it contains audio data
def edit(file):
  pattern = r'\'unknown\'.*' #if line starts with 'unknown' then return line else None
  for line in file:
    if re.search(pattern, line):
      return line[:-1];
  return None;
    
#writes line and hr to out in format supported by libsvm
def write(out,line,scale,hr):
  pattern = re.compile("^\s+|\s*,\s*|\s+$")
  out.write(str(hr) + " ");
  scale_index = 0
  label = 1
  for word in pattern.split(line):
    if len(scale) > scale_index:
      scale_line = scale[scale_index]    
      pattern = str(label) + ' (-?\d+.?\d*e?[+-]?\d*) (-?\d+.?\d*e?[+-]?\d*)'     
      pat = re.search(pattern,scale[scale_index])      
      if(pat):
        val = scale_val(float(pat.groups()[0]),float(pat.groups()[1]),0,10,float(word))        
        out.write(str(label)+":"+str(val)+" ");
        scale_index = scale_index + 1
      label = label + 1
    else:
      break
  out.write('\n');
  return  

def scale_val(min,max,a,b,x):
  return a + ((b-a)*(x-min)/(max-min))

def getHeartRate(filepath):
  base = os.path.basename(filepath)
  print base
  pattern = 'user=\w+_hr=(\d+.?\d*).wav'
  pat = re.search(pattern,filepath)
  if(pat):
    return pat.groups()[0]
  else:
    return None           
 
if(len(sys.argv) >= 3):
  #arg 1 input wav file path
  #arg 2 file which contains instances
  #arg 3 modelfilepath
  wavFile = sys.argv[1]
  instanceFile = sys.argv[2]
  modelFile = sys.argv[3]
  hr = getHeartRate(wavFile) #get nearest integer
  if hr != None:
    hr = int(round(float(hr),0))
    tempfile1 = tempfile.NamedTemporaryFile()
    tempfile1.seek(0)
    openSmile(wavFile,tempfile1.name)
 #   with open(instanceFile,'a') as instance:
 #     processOpenSmile(hr,tempfile1,instance)
    tempfile1.close()
  #  trainModel(instanceFile,modelFile)
  else:
    print "failed to retrieve heart rate from file"
else:
  print"file requires 3 argument \n\targ1 = wave file to be trained \n\targ2 = file with Instances\n\targ3 = Path To Store/Overwrite Model File"
