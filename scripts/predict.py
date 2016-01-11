lib_svm_path = '../libsvm-3.20/python'
import sys
import os
import re
import tempfile
import subprocess
from subprocess import Popen
from subprocess import PIPE
sys.path.append(lib_svm_path)
from svmutil import *

model_file = '../libsvm-3.20/Model/libsvm.model'
scale_file = '../libsvm-3.20/scale_file'
config_file = '../openSMILE-2.2rc1/config/gemaps/GeMAPSv01a.conf'

#given an instance file runs it through the model file to get predictions and 
#returns the prediction
def makePrediction(instance_file):
  # Read data in LIBSVM format
  y, x = svm_read_problem(instance_file)
  m = svm_load_model(model_file)
  p_label, p_acc, p_val = svm_predict(y, x, m,"-q")
  #print p_acc
  #print p_val
  return p_label

#runs opensmile on wav_file and writes output to out_file
def openSmile(wav_file,out_file):
  FNULL = open(os.devnull, 'w')
  subprocess.call(['openSMILE-2.2rc1/inst/bin/SMILExtract',"-C",str(config_file),"-I",str(wav_file),"-O",str(out_file)],stdout=FNULL, stderr=subprocess.STDOUT)

#removes unneccessary info from in_file and prepares data to be in readable from for libsvm
def processOpenSmile(in_file,processed_file):
    hr = 50
    line = None;
    f = open(scale_file,'r')
    scale_lines = f.readlines()
    f.close()
    with in_file as cur_file:
      line = edit(cur_file);
      if(line != None):
        write(processed_file,line,scale_lines,hr)    

#returns line if it contains audio data
def edit(file):
  pattern = r'\'unknown\'.*' #if line starts with unknown the write it to outfile
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

if(len(sys.argv) >= 1):
  tempfile1 = tempfile.NamedTemporaryFile()
  tempfile1.seek(0)
  openSmile(sys.argv[1],tempfile1.name)
  tempfile2 = tempfile.NamedTemporaryFile()
  tempfile2.seek(0)
  processOpenSmile(tempfile1,tempfile2)
  tempfile1.close()
  #print tempfile2.read()
  tempfile2.seek(0)
  hr = makePrediction(tempfile2.name)[0]
  hr = round(hr,0)
  print hr
  if(len(sys.argv) >= 2):
    with open(sys.argv[2],'w+') as f:
      f.write(str(hr))
